package me.projectexledger.domain.exchange.api;

// 1. 반드시 이 두 가지가 임포트되어야 합니다.
import me.projectexledger.domain.exchange.dto.ExchangeRateDto;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class FrankfurterClient implements ExchangeRateProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_URL = "https://api.frankfurter.app/latest?from=KRW";

    @Override
    // 2. 반환 타입을 인터페이스와 동일하게 List<ExchangeRateDto>로 선언
    public List<ExchangeRateDto> fetchRates() {
        Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);

        if (response == null || !response.containsKey("rates")) {
            return List.of(); // 빈 리스트 반환
        }

        Map<String, Object> rates = (Map<String, Object>) response.get("rates");

        // 3. 데이터를 가공하여 List<ExchangeRateDto> 형태로 반환
        return rates.entrySet().stream()
                .map(entry -> ExchangeRateDto.builder()
                        .curUnit(entry.getKey())
                        .curNm(entry.getKey())
                        .rate(BigDecimal.ONE.divide(new BigDecimal(entry.getValue().toString()), 4, RoundingMode.HALF_UP))
                        .provider(getProviderName())
                        .updatedAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList()); // 리스트로 변환하여 반환 타입 일치
    }

    @Override
    public String getProviderName() {
        return "FRANKFURTER";
    }
}