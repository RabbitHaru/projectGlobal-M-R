package me.projectexledger.domain.exchange.controller;

import lombok.RequiredArgsConstructor;
import me.projectexledger.domain.exchange.dto.ExchangeRateDto;
import me.projectexledger.domain.exchange.service.ExchangeRateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exchange")
@RequiredArgsConstructor
public class ExchangeController {

    private final ExchangeRateService exchangeRateService;


     // FXTicker.tsx에서 호출하는 엔드포인트
     // DB 또는 Redis에서 23개 통화의 최신 환율 정보를 반환합니다.

    @GetMapping("/latest")
    public ResponseEntity<List<ExchangeRateDto>> getLatestRates() {
        // Service에서 캐시된 데이터 혹은 DB 데이터를 가져옵니다.
        List<ExchangeRateDto> rates = exchangeRateService.getLatestRatesFromCacheOrDb();
        return ResponseEntity.ok(rates);
    }
}