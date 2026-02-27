package me.projectexledger.domain.exchange.api;

import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.exchange.dto.ExchangeRateDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class KoreaEximClient implements ExchangeRateProvider {

    @Value("${api.koreaexim.key}") // application.yml 등에 설정된 키 호출
    private String authKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_URL = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON";

    @Override
    public List<ExchangeRateDto> fetchRates() {
        try {
            // 2. fromHttpUrl 대신 fromUriString 사용 (더 넓은 호환성)
            String url = UriComponentsBuilder.fromUriString(API_URL)
                    .queryParam("authkey", authKey)
                    .queryParam("data", "AP01")
                    .build()
                    .toUriString();

            log.info("Requesting Exchange Rate API: {}", url);

            Map<String, Object>[] response = restTemplate.getForObject(url, Map[].class);

            if (response == null || response.length == 0) {
                return Collections.emptyList();
            }

            return Arrays.stream(response)
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("수출입은행 API 호출 실패: {}", e.getMessage());
            throw new RuntimeException("Primary API (KoreaExim) is down", e);
        }
    }

    @Override
    public String getProviderName() {
        return "KOREAEXIM";
    }

    private ExchangeRateDto convertToDto(Map<String, Object> map) {
        // "deal_bas_r"은 "1,340.5" 처럼 콤마가 포함된 문자열로 오므로 전처리 필요
        String rateStr = map.get("deal_bas_r").toString().replace(",", "");

        return ExchangeRateDto.builder()
                .curUnit(map.get("cur_unit").toString())
                .curNm(map.get("cur_nm").toString())
                .rate(new BigDecimal(rateStr))
                .provider(getProviderName())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}