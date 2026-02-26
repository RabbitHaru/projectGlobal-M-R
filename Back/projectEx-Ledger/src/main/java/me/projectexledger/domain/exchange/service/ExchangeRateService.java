package me.projectexledger.domain.exchange.service;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.exchange.api.FrankfurterClient;
import me.projectexledger.domain.exchange.api.KoreaEximClient;
import me.projectexledger.domain.exchange.dto.ExchangeRateDTO;
import me.projectexledger.domain.exchange.entity.ExchangeRate;
import me.projectexledger.domain.exchange.repository.ExchangeRateRepository;
import me.projectexledger.domain.exchange.utils.CurrencyMapper; // 🌟 필터링을 위해 필요
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

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

    @PostConstruct
    public void init() {
        log.info("🚀 [시스템 시작] 환율 데이터 정합성 체크 및 초기화 시작...");
        backfillHistoricalData();
    }

    /**
     * 🌟 5대 문제 해결 버전 백필 로직
     */
    @Transactional
    public void backfillHistoricalData() {
        log.info("=== 📂 10일치 데이터 통합 백필 시작 (2026-02-26 기준) ===");

        // [해결 3] i를 0부터 시작하여 오늘(26일) 데이터까지 체크합니다.
        for (int i = 10; i >= 0; i--) {
            LocalDate targetDate = LocalDate.now().minusDays(i);
            String dateStr = targetDate.toString();

            LocalDateTime startOfDay = targetDate.atStartOfDay();
            LocalDateTime endOfDay = targetDate.atTime(LocalTime.MAX);

            // [해결 3] 해당 날짜의 데이터가 이미 있으면 절대 다시 가져오지 않습니다.
            if (exchangeRateRepository.existsByUpdatedAtBetween(startOfDay, endOfDay)) {
                log.info("⏩ [{}] 데이터가 이미 존재하여 스킵합니다.", dateStr);
                continue;
            }

            log.info("🔄 [{}] 데이터 수집 시도 중...", dateStr);

            List<ExchangeRateDTO> finalDtos = new ArrayList<>();

            // 1. 한국수출입은행 우선 시도 (23~26일 데이터 타겟)
            List<ExchangeRateDTO> eximDtos = koreaEximClient.fetchHistoricalRates(dateStr);

            if (eximDtos != null && !eximDtos.isEmpty()) {
                // [해결 4, 5] 수출입은행 데이터가 있으면 이것만 사용 (순수 KOREAEXIM 데이터)
                finalDtos = eximDtos;
            } else {
                // 2. 수출입은행 데이터가 없으면(주말 등) 프랑크푸터로 대체 (16~22일 데이터 타겟)
                log.info("⚠️ [{}] 수출입은행 데이터 없음. 프랑크푸터 API로 대체합니다.", dateStr);
                List<ExchangeRateDTO> frankDtos = frankfurterClient.fetchHistoricalRates(dateStr);

                // [해결 5] 프랑크푸터 데이터 중 우리가 지원하는 통화(Mapper에 등록된 것)만 필터링
                finalDtos = frankDtos.stream()
                        .filter(dto -> CurrencyMapper.isSupported(dto.getCurUnit()))
                        .collect(Collectors.toList());
            }

            if (!finalDtos.isEmpty()) {
                // [해결 4] saveToDatabase 내부에서 DTO의 Provider를 그대로 유지하도록 보장
                saveToDatabase(finalDtos);
                log.info("✅ [{}] 저장 완료 (건수: {}, 출처: {})",
                        dateStr, finalDtos.size(), finalDtos.get(0).getProvider());
            }

            try { Thread.sleep(500); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }
        log.info("=== 🏁 모든 과거 데이터 통합 수집 완료 ===");
    }

    public List<ExchangeRateDTO> getLatestRatesFromCacheOrDb() {
        try {
            @SuppressWarnings("unchecked")
            List<ExchangeRateDTO> cachedRates = (List<ExchangeRateDTO>) redisTemplate.opsForValue().get(REDIS_KEY);
            if (cachedRates != null && !cachedRates.isEmpty()) return cachedRates;
        } catch (Exception e) {
            log.warn("Redis 연결 불가: {}", e.getMessage());
        }

        List<ExchangeRate> entities = exchangeRateRepository.findAllLatestRates();
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
                    changeRate = changeAmount
                            .divide(yesterday.getRate(), 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"));
                }
            }

            dtos.add(ExchangeRateDTO.builder()
                    .curUnit(today.getCurUnit())
                    .curNm(today.getCurNm())
                    .rate(today.getRate())
                    .provider(today.getProvider())
                    .updatedAt(today.getUpdatedAt().format(formatter))
                    .changeAmount(changeAmount)
                    .changeRate(changeRate)
                    .build());
        }

        if (!dtos.isEmpty()) saveToCache(dtos);
        return dtos;
    }

    /**
     * 실시간 업데이트 시에도 중복 체크 후 저장하도록 보완
     */
    @Transactional
    public List<ExchangeRateDTO> updateAndCacheRates() {
        // 오늘 데이터가 이미 있는지 먼저 확인
        LocalDate today = LocalDate.now();
        if (exchangeRateRepository.existsByUpdatedAtBetween(today.atStartOfDay(), today.atTime(LocalTime.MAX))) {
            log.info("이미 오늘자 최신 데이터가 DB에 있습니다.");
            return getLatestRatesFromCacheOrDb();
        }

        List<ExchangeRateDTO> dtos;
        try {
            dtos = koreaEximClient.fetchRates();
        } catch (Exception e) {
            log.warn("수출입은행 API 실패, 보조 API로 전환");
            dtos = frankfurterClient.fetchRates();
        }

        if (dtos != null && !dtos.isEmpty()) {
            saveToDatabase(dtos);
            return getLatestRatesFromCacheOrDb();
        }
        return new ArrayList<>();
    }

    private void saveToDatabase(List<ExchangeRateDTO> dtos) {
        List<ExchangeRate> entities = dtos.stream()
                .map(dto -> ExchangeRate.builder()
                        .curUnit(dto.getCurUnit())
                        .curNm(dto.getCurNm())
                        .rate(dto.getRate())
                        // [해결 4] DTO에 담긴 Provider(KOREAEXIM 또는 FRANKFURTER)를 그대로 엔티티에 저장
                        .provider(dto.getProvider())
                        .updatedAt(parseDateTime(dto.getUpdatedAt()))
                        .build())
                .toList();

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
        } catch (Exception ignored) {}
    }
}