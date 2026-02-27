package me.projectexledger.domain.exchange.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.exchange.service.ExchangeRateService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExchangeScheduler {
    private final ExchangeRateService exchangeRateService;

    @EventListener(ApplicationReadyEvent.class)
    public void scheduleExchangeUpdate() {
        log.info("--- 환율 자동 수집 스케줄러 시작 ---");
        try {
            exchangeRateService.updateAndCacheRates();
            log.info("--- 환율 자동 수집 및 캐싱 완료 ---");
        } catch (Exception e) {
            log.error("환율 수집 중 오류 발생: {}", e.getMessage());
        }
    }
}