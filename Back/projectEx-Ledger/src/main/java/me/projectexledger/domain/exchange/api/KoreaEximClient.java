package me.projectexledger.domain.exchange.api;

import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.exchange.dto.ExchangeRateDTO;
import me.projectexledger.domain.exchange.utils.CurrencyMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class KoreaEximClient implements ExchangeRateProvider {

    @Value("${api.koreaexim.key}")
    private String authKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_URL = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON";
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public List<ExchangeRateDTO> fetchRates() {
        return fetchHistoricalRates(LocalDate.now().toString());
    }

    public List<ExchangeRateDTO> fetchHistoricalRates(String dateStr) {
        String searchDate = dateStr.replace("-", "");
        try {
            String url = UriComponentsBuilder.fromUriString(API_URL)
                    .queryParam("authkey", authKey)
                    .queryParam("data", "AP01")
                    .queryParam("searchdate", searchDate)
                    .build()
                    .toUriString();

            Map<String, Object>[] response = restTemplate.getForObject(url, Map[].class);

            if (response == null || response.length == 0) {
                return Collections.emptyList();
            }

            String timestamp = dateStr + " 11:00:00";

            return Arrays.stream(response)
                    // 🌟 1. 불필요한 KRW(원화 기준) 데이터 원천 차단
                    .filter(map -> !map.get("cur_unit").toString().contains("KRW"))
                    .map(map -> convertToDto(map, timestamp))
                    // 🌟 2. 우리가 지원하는 국가만 남기기 (옵션이지만 안전장치)
                    .filter(dto -> CurrencyMapper.isSupported(dto.getCurUnit()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("KoreaExim API 에러: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public String getProviderName() {
        return "KOREAEXIM";
    }

    private ExchangeRateDTO convertToDto(Map<String, Object> map, String timestamp) {
        String rawUnit = map.get("cur_unit").toString();
        String rateStr = map.get("deal_bas_r").toString().replace(",", "");
        BigDecimal rate = new BigDecimal(rateStr);

        // 🌟 3. JPY(100), IDR(100) 등을 1단위로 정규화
        String curUnit = rawUnit;
        if (rawUnit.contains("(100)")) {
            curUnit = rawUnit.replace("(100)", "").trim(); // "JPY(100)" -> "JPY"
            rate = rate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP); // 918 -> 9.18
        }

        return ExchangeRateDTO.builder()
                .curUnit(curUnit)
                .curNm(CurrencyMapper.getName(curUnit))
                .rate(rate)
                .provider(getProviderName())
                .updatedAt(timestamp)
                .changeAmount(BigDecimal.ZERO)
                .changeRate(BigDecimal.ZERO)
                .build();
    }
}