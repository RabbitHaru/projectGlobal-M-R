package me.projectexledger.domain.exchange.service;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class CurrencyCalculator {

    // 기본 수수료율 설정 (예: 1% = 0.01)
    private static final BigDecimal DEFAULT_FEE_RATE = new BigDecimal("0.01");

    // * 외화를 원화로 환산 (매수 시)
    // * 공식: (외화 금액 * 환율) * (1 + 수수료율)

    public BigDecimal calculateKrwAmount(BigDecimal foreignAmount, BigDecimal rate) {
        BigDecimal baseAmount = foreignAmount.multiply(rate);
        BigDecimal fee = baseAmount.multiply(DEFAULT_FEE_RATE);

        // 원화는 보통 소수점이 없으므로 반올림하여 정수로 처리
        return baseAmount.add(fee).setScale(0, RoundingMode.HALF_UP);
    }

    // 수수료가 제외된 순수 환율 계산 (우대율 적용 시 확장 가능)

    public BigDecimal applyPreferentialRate(BigDecimal baseRate, BigDecimal preference) {
        // preference가 0.9라면 수수료의 90%를 깎아주는 등의 로직 추가 가능
        return baseRate;
    }
}