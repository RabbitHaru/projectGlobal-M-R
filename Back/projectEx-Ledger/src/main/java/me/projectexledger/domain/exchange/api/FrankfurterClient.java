package me.projectexledger.domain.exchange.api;

import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.exchange.dto.ExchangeRateDTO;
import me.projectexledger.domain.exchange.utils.CurrencyMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class FrankfurterClient implements ExchangeRateProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BASE_URL = "https://api.frankfurter.app/";
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public List<ExchangeRateDTO> fetchRates() {
        return fetchHistoricalRates("latest");
    }

    public List<ExchangeRateDTO> fetchHistoricalRates(String datePath) {
        String url = BASE_URL + datePath + "?from=KRW";

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("rates")) {
                return List.of();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> rates = (Map<String, Object>) response.get("rates");
            String timestamp = datePath.equals("latest")
                    ? LocalDateTime.now().format(formatter)
                    : datePath + " 10:00:00";

            return rates.entrySet().stream()
                    // 🌟 1. KRW 차단
                    .filter(entry -> !entry.getKey().equals("KRW"))
                    .map(entry -> {
                        String curUnit = entry.getKey();

                        // 🌟 2. [위안화 마법] 프랑크푸터의 CNY를 CNH로 강제 개명시켜서 데이터 단절 방지!
                        if (curUnit.equals("CNY")) {
                            curUnit = "CNH";
                        }

                        BigDecimal rateValue = BigDecimal.ONE.divide(
                                new BigDecimal(entry.getValue().toString()), 4, RoundingMode.HALF_UP);

                        return ExchangeRateDTO.builder()
                                .curUnit(curUnit)
                                .curNm(CurrencyMapper.getName(curUnit))
                                .rate(rateValue)
                                .provider(getProviderName())
                                .updatedAt(timestamp)
                                .changeAmount(BigDecimal.ZERO)
                                .changeRate(BigDecimal.ZERO)
                                .build();
                    })
                    // 🌟 3. 우리가 사전에 정의한 통화(CurrencyMapper)만 리스트에 통과시킴
                    .filter(dto -> CurrencyMapper.isSupported(dto.getCurUnit()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Frankfurter API 호출 에러: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public String getProviderName() {
        return "FRANKFURTER";
    }
}