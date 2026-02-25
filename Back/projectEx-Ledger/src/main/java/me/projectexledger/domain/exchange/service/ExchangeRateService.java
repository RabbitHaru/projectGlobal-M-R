package me.projectexledger.domain.exchange.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.exchange.api.FrankfurterClient;
import me.projectexledger.domain.exchange.api.KoreaEximClient;
import me.projectexledger.domain.exchange.dto.ExchangeRateDto;
import me.projectexledger.domain.exchange.entity.ExchangeRate;
import me.projectexledger.domain.exchange.repository.ExchangeRateRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final KoreaEximClient koreaEximClient;
    private final FrankfurterClient frankfurterClient;
    private final ExchangeRateRepository exchangeRateRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CurrencyCalculator currencyCalculator;

    private static final String REDIS_KEY = "LATEST_RATES";

     // 특정 통화의 현재 환율로 원화 환산 금액 계산

    public BigDecimal getConvertedAmount(String curUnit, BigDecimal amount) {
        // 1. Redis에서 최신 환율 조회 시도
        // 2. 없을 경우 DB에서 최신 환율 조회
        ExchangeRate rateEntity = exchangeRateRepository.findFirstByCurUnitOrderByUpdatedAtDesc(curUnit)
                .orElseThrow(() -> new RuntimeException("해당 통화의 환율 정보가 없습니다."));

        return currencyCalculator.calculateKrwAmount(amount, rateEntity.getRate());
    }

    @Transactional // DB 저장을 위해 트랜잭션 추가
    public List<ExchangeRateDto> updateAndCacheRates() {
        List<ExchangeRateDto> dtos;

        try {
            dtos = koreaEximClient.fetchRates();
        } catch (Exception e) {
            log.warn("KoreaExim failed, falling back to Frankfurter");
            dtos = frankfurterClient.fetchRates();
        }

        if (!dtos.isEmpty()) {
            // 1. DB에 이력 저장
            saveToDatabase(dtos);
            // 2. Redis 캐시 갱신
            saveToCache(dtos);
        }

        return dtos;
    }

    private void saveToDatabase(List<ExchangeRateDto> dtos) {
        List<ExchangeRate> entities = dtos.stream()
                .map(dto -> ExchangeRate.builder()
                        .curUnit(dto.getCurUnit())
                        .curNm(dto.getCurNm())
                        .rate(dto.getRate())
                        .provider(dto.getProvider())
                        .updatedAt(dto.getUpdatedAt())
                        .build())
                .toList();

        exchangeRateRepository.saveAll(entities);
        log.info("Saved {} exchange rate records to MariaDB.", entities.size());
    }

    private void saveToCache(List<ExchangeRateDto> rates) {
        // 실시간 환율은 신선도가 중요하므로 TTL을 1시간으로 설정 (이미지 1 참조)
        redisTemplate.opsForValue().set(REDIS_KEY, rates, Duration.ofHours(1));
    }
}