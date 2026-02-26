package me.projectexledger.domain.settlement.util;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 정산 환율 및 수수료 계산기
 * - 시니어 리드 가이드: 모든 금융 계산은 BigDecimal을 사용하며, 부동소수점 연산을 철저히 배제합니다.
 */
@Component
public class ExchangeRateCalculator {

    /**
     * 최종 적용 환율을 계산합니다.
     * 공식: 최종적용환율 = 매매기준율 + (전산환전수수료 * (1 - 우대율))
     *
     * @param baseRate      매매기준율 (예: 1350.50)
     * @param spread        전산 환전 수수료 (예: 10.00)
     * @param preferredRate 우대율 (예: 90% 우대인 경우 0.90 입력)
     * @return 최종 적용 환율 (소수점 4자리까지 반올림)
     */
    public BigDecimal calculateFinalRate(BigDecimal baseRate, BigDecimal spread, BigDecimal preferredRate) {

        // 1. (1 - 우대율) 계산
        BigDecimal oneMinusPreferredRate = BigDecimal.ONE.subtract(preferredRate);

        // 2. 할인된 수수료 계산 = 전산환전수수료 * (1 - 우대율)
        BigDecimal discountedSpread = spread.multiply(oneMinusPreferredRate);

        // 3. 최종 환율 계산 = 매매기준율 + 할인된 수수료
        BigDecimal finalRate = baseRate.add(discountedSpread);

        // 4. 소수점 처리 (금융권 표준: 넉넉하게 소수점 4자리까지 저장 후 반올림)
        // 주의: 실제 비즈니스 기획(버림, 올림 등)에 따라 RoundingMode 변경 필요
        return finalRate.setScale(4, RoundingMode.HALF_UP);
    }

    /**
     * 최종 고객에게 정산할 원화 금액을 계산합니다.
     * @param foreignAmount 외화 결제 금액
     * @param finalRate     계산된 최종 적용 환율
     * @return 정산 금액 (원화는 소수점이 없으므로 0자리로 반올림 또는 버림 처리)
     */
    public BigDecimal calculateSettlementAmount(BigDecimal foreignAmount, BigDecimal finalRate) {
        return foreignAmount.multiply(finalRate).setScale(0, RoundingMode.FLOOR); // 원화는 1원 단위 미만 절사(버림)가 일반적
    }
}