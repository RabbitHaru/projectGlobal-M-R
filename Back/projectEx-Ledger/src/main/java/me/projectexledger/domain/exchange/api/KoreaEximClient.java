package me.projectexledger.domain.exchange.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.config.KoreaEximProperties;
import me.projectexledger.domain.exchange.dto.ExchangeRateDTO;
import me.projectexledger.domain.exchange.utils.CurrencyMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor // 생성자 주입을 통한 불변성 확보
public class KoreaEximClient implements ExchangeRateProvider {

    private final KoreaEximProperties properties;
    private final RestTemplate restTemplate = new RestTemplate(); // 필요 시 Bean으로 주입 권장

    @Override
    public List<ExchangeRateDTO> fetchRates() {
        return fetchHistoricalRates(LocalDate.now().toString());
    }

    public List<ExchangeRateDTO> fetchHistoricalRates(String dateStr) {
        String searchDate = dateStr.replace("-", "");
        try {
            // 🌟 프로퍼티를 활용한 동적 URL 생성
            String url = UriComponentsBuilder.fromUriString(properties.getBaseUrl())
                    .queryParam("authkey", properties.getServiceKey())
                    .queryParam("data", properties.getDataType())
                    .queryParam("searchdate", searchDate)
                    .build()
                    .toUriString();

            Map<String, Object>[] response = restTemplate.getForObject(url, Map[].class);

            if (response == null || response.length == 0) {
                log.warn("⚠️ [{}] 해당 날짜의 데이터가 존재하지 않습니다 (주말/공휴일 가능성).", dateStr);
                return Collections.emptyList();
            }

            String timestamp = dateStr + " 11:00:00";

            return Arrays.stream(response)
                    .filter(map -> !map.get("cur_unit").toString().contains("KRW"))
                    .map(map -> convertToDto(map, timestamp))
                    .filter(dto -> CurrencyMapper.isSupported(dto.getCurUnit()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ KoreaExim API 호출 에러 [{}]: {}", dateStr, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public String getProviderName() {
        return "KOREAEXIM";
    }

    private ExchangeRateDTO convertToDto(Map<String, Object> map, String timestamp) {
        String rawUnit = map.get("cur_unit").toString();
        // Deal Basis Rate (매매 기준율) 파싱
        String rateStr = map.get("deal_bas_r").toString().replace(",", "");
        BigDecimal rate = new BigDecimal(rateStr);

        // 🌟 JPY(100), IDR(100) 단위 정규화 (Settlement Accuracy 확보)
        String curUnit = rawUnit;
        if (rawUnit.contains("(100)")) {
            curUnit = rawUnit.replace("(100)", "").trim();
            rate = rate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
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