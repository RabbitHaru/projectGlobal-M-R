package me.projectexledger.domain.exchange.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.exchange.api.FrankfurterClient;
import me.projectexledger.domain.exchange.api.KoreaEximClient;
import me.projectexledger.domain.exchange.dto.ExchangeRateDto;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final KoreaEximClient koreaEximClient;
    private final FrankfurterClient frankfurterClient;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REDIS_KEY = "LATEST_RATES";


    // 최신 환율 정보를 가져오고 캐싱합니다. (Failover 적용)

    public List<ExchangeRateDto> updateAndCacheRates() {
        List<ExchangeRateDto> rates;

        try {
            // 1. 우선순위 1: 한국수출입은행 API 시도
            log.info("Attempting to fetch rates from KoreaExim...");
            rates = koreaEximClient.fetchRates();

        } catch (Exception e) {
            // 2. 실패 시 우선순위 2: Frankfurter API로 Failover
            log.warn("KoreaExim API failed. Falling back to Frankfurter. Error: {}", e.getMessage());
            rates = frankfurterClient.fetchRates();
        }

        if (!rates.isEmpty()) {
            // 3. Redis 캐시 갱신 (이미지 1의 '데이터 캐싱 처리' 요구사항 반영)
            saveToCache(rates);
            log.info("Successfully updated rates for {} currencies.", rates.size());
        }

        return rates;
    }

    private void saveToCache(List<ExchangeRateDto> rates) {
        // 실시간 환율은 신선도가 중요하므로 TTL을 1시간으로 설정 (이미지 1 참조)
        redisTemplate.opsForValue().set(REDIS_KEY, rates, Duration.ofHours(1));
    }
}