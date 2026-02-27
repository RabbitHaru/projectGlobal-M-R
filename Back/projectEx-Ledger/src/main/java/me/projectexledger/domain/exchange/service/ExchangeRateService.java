package me.projectexledger.domain.exchange.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.exchange.api.FrankfurterClient;
import me.projectexledger.domain.exchange.api.KoreaEximClient;
import me.projectexledger.domain.exchange.dto.ExchangeRateDTO;
import me.projectexledger.domain.exchange.dto.ExchangeRateResponseDTO;
import me.projectexledger.domain.exchange.entity.ExchangeRate;
import me.projectexledger.domain.exchange.repository.ExchangeRateRepository;
import me.projectexledger.domain.exchange.utils.CurrencyMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final KoreaEximClient koreaEximClient;
    private final FrankfurterClient frankfurterClient;
    private final ExchangeRateRepository exchangeRateRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REDIS_KEY = "LATEST_RATES";
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


     // 1. 실시간 업데이트 및 캐시 갱신 (Scheduler에서 호출하는 핵심 메서드)

    @Transactional
    public List<ExchangeRateDTO> updateAndCacheRates() {
        LocalDate today = LocalDate.now();

        // 이미 오늘 데이터가 있으면 수집 생략하고 현재 최신 데이터 반환
        if (isDataAlreadyExists(today)) {
            log.info("⏩ 오늘자 환율 데이터가 이미 존재합니다. 캐시를 유지하거나 DB에서 가져옵니다.");
            return getLatestRatesFromCacheOrDb();
        }

        // 최신 데이터 수집
        List<ExchangeRateDTO> dtos = fetchFromBestSource(today.toString());

        if (dtos != null && !dtos.isEmpty()) {
            saveToDatabaseTransactional(dtos);
            // 저장 직후 Redis 캐시 강제 갱신을 위해 DB에서 다시 읽어 반환
            log.info("✅ 오늘자 최신 환율 수집 및 캐시 갱신 완료");
            return getLatestRatesFromCacheOrDb();
        }

        return new ArrayList<>();
    }

    // 2. 전광판용 최신 환율 조회 (캐시 우선)

    public List<ExchangeRateDTO> getLatestRatesFromCacheOrDb() {
        try {
            @SuppressWarnings("unchecked")
            List<ExchangeRateDTO> cachedRates = (List<ExchangeRateDTO>) redisTemplate.opsForValue().get(REDIS_KEY);
            if (cachedRates != null && !cachedRates.isEmpty()) return cachedRates;
        } catch (Exception e) {
            log.warn("⚠️ Redis 연결 불가: {}", e.getMessage());
        }

        List<ExchangeRate> entities = exchangeRateRepository.findAllLatestRates();
        List<ExchangeRateDTO> dtos = calculateChangeStats(entities);

        if (!dtos.isEmpty()) saveToCache(dtos);
        return dtos;
    }

    // 3. 차트용 히스토리 조회

    @Transactional(readOnly = true)
    public List<ExchangeRateResponseDTO> getExchangeRateHistory(String curUnit, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return exchangeRateRepository.findByCurUnitAndUpdatedAtAfterOrderByUpdatedAtAsc(curUnit, startDate)
                .stream()
                .map(ExchangeRateResponseDTO::from)
                .collect(Collectors.toList());
    }

    // 4. 데이터 수집 공통 로직

    public void backfillHistoricalData() {
        log.info("=== 📂 데이터 백필 프로세스 시작 ===");
        for (int i = 10; i >= 0; i--) {
            LocalDate targetDate = LocalDate.now().minusDays(i);
            if (isDataAlreadyExists(targetDate)) continue;

            List<ExchangeRateDTO> finalDtos = fetchFromBestSource(targetDate.toString());
            if (!finalDtos.isEmpty()) {
                saveToDatabaseTransactional(finalDtos);
            }
        }
    }

    // --- 내부 지원 메서드 (Private) ---

    private boolean isDataAlreadyExists(LocalDate date) {
        return exchangeRateRepository.existsByCurUnitAndUpdatedAtBetween(
                "USD", date.atStartOfDay(), date.atTime(LocalTime.MAX));
    }

    private List<ExchangeRateDTO> fetchFromBestSource(String dateStr) {
        try {
            List<ExchangeRateDTO> eximDtos = koreaEximClient.fetchHistoricalRates(dateStr);
            if (eximDtos != null && !eximDtos.isEmpty()) return eximDtos;
        } catch (Exception e) {
            log.warn("⚠️ 소스 API 실패 [{}]: {}", dateStr, e.getMessage());
        }
        return frankfurterClient.fetchHistoricalRates(dateStr).stream()
                .filter(dto -> CurrencyMapper.isSupported(dto.getCurUnit()))
                .collect(Collectors.toList());
    }

    private List<ExchangeRateDTO> calculateChangeStats(List<ExchangeRate> entities) {
        List<ExchangeRateDTO> dtos = new ArrayList<>();
        for (ExchangeRate today : entities) {
            List<ExchangeRate> history = exchangeRateRepository.findRecentByCurUnit(
                    today.getCurUnit(), PageRequest.of(0, 2));

            BigDecimal changeAmount = BigDecimal.ZERO;
            BigDecimal changeRate = BigDecimal.ZERO;

            if (history.size() >= 2) {
                ExchangeRate yesterday = history.get(1);
                changeAmount = today.getRate().subtract(yesterday.getRate());
                if (yesterday.getRate().compareTo(BigDecimal.ZERO) != 0) {
                    changeRate = changeAmount.divide(yesterday.getRate(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
                }
            }

            dtos.add(ExchangeRateDTO.builder()
                    .curUnit(today.getCurUnit()).curNm(today.getCurNm())
                    .rate(today.getRate()).provider(today.getProvider())
                    .updatedAt(today.getUpdatedAt().format(formatter))
                    .changeAmount(changeAmount).changeRate(changeRate).build());
        }
        return dtos;
    }

    @Transactional
    public void saveToDatabaseTransactional(List<ExchangeRateDTO> dtos) {
        List<ExchangeRate> entities = dtos.stream()
                .map(dto -> ExchangeRate.builder()
                        .curUnit(dto.getCurUnit()).curNm(dto.getCurNm())
                        .rate(dto.getRate()).provider(dto.getProvider())
                        .updatedAt(parseDateTime(dto.getUpdatedAt())).build())
                .collect(Collectors.toList());
        exchangeRateRepository.saveAll(entities);
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            return LocalDateTime.parse(dateTimeStr, formatter);
        } catch (Exception e) {
            try {
                return LocalDate.parse(dateTimeStr).atStartOfDay();
            } catch (Exception e2) {
                return LocalDateTime.now();
            }
        }
    }

    private void saveToCache(List<ExchangeRateDTO> rates) {
        try {
            redisTemplate.opsForValue().set(REDIS_KEY, rates, Duration.ofMinutes(10));
        } catch (Exception ignored) {
        }
    }
}