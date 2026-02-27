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

     // Redis 캐시를 먼저 확인하고, 없으면 DB에서 가장 최신 고시 데이터를 가져옵니다.
     // 컨트롤러 규격에 맞춰 List<ExchangeRateDto>를 반환하도록 수정했습니다.

    public List<ExchangeRateDto> getLatestRatesFromCacheOrDb() {
        // 1. Redis 확인
        try {
            List<ExchangeRateDto> cachedRates = (List<ExchangeRateDto>) redisTemplate.opsForValue().get(REDIS_KEY);
            if (cachedRates != null && !cachedRates.isEmpty()) {
                log.info("Returning rates from Redis cache.");
                return cachedRates;
            }
        } catch (Exception e) {
            log.error("Redis error: {}", e.getMessage());
        }

        // 2. Redis에 없으면 DB에서 조회
        List<ExchangeRate> entities = exchangeRateRepository.findAllLatestRates();

        // 3. Entity -> DTO 변환
        List<ExchangeRateDto> dtos = entities.stream()
                .map(entity -> ExchangeRateDto.builder()
                        .curUnit(entity.getCurUnit())
                        .curNm(entity.getCurNm())
                        .rate(entity.getRate())
                        .provider(entity.getProvider())
                        .updatedAt(entity.getUpdatedAt())
                        .build())
                .toList();

        // 4. 캐시가 비어있었다면 DB 데이터로 다시 채워줌 (데이터 정합성)
        if (!dtos.isEmpty()) {
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
        redisTemplate.opsForValue().set(REDIS_KEY, rates, Duration.ofHours(1));
    }
}