package me.projectexledger.domain.exchange.api;

import me.projectexledger.domain.exchange.dto.ExchangeRateDto;
import java.util.List;

    // 외부 환율 API 연동을 위한 공통 인터페이스
public interface ExchangeRateProvider {

    // 외부 API로부터 실시간 환율 데이터를 가져옵니다.

    List<ExchangeRateDto> fetchRates();


    // 현재 공급자의 이름을 반환합니다 (KOREAEXIM, FRANKFURTER 등)

    String getProviderName();
}