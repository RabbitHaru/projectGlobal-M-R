package me.projectexledger.domain.exchange.service;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class CurrencyCalculator {

    /**
     * 최종 정산 금액(KRW) 계산 로직
     * 공식: (외화금액 - 플랫폼수수료 - 국가별비용) * 최종적용환율
     */
    public BigDecimal calculateFinalSettlementAmount(
            BigDecimal foreignAmount,
            BigDecimal baseRate,
            BigDecimal platformFeeRate, // 예: 0.015 (1.5%)
            BigDecimal networkFee,      // 예: 2000 (국가별 고정비)
            BigDecimal spread,          // 예: 10.0 (환전 수수료)
            BigDecimal preferenceRate   // 예: 0.9 (90% 우대)
    ) {
        // 1. 플랫폼 수수료 계산 및 차감
        BigDecimal platformFee = foreignAmount.multiply(platformFeeRate);
        BigDecimal amountAfterPlatform = foreignAmount.subtract(platformFee);

        // 2. 최종 적용 환율 계산 (매매기준율 + (스프레드 * (1 - 우대율)))
        BigDecimal finalRate = calculateFinalRate(baseRate, spread, preferenceRate);

        // 3. 원화 환산 및 국가별 네트워크 수수료(원화 기준) 차감
        // 공식 예시: (외화 순수금액 * 환율) - 고정비용
        BigDecimal krwGrossAmount = amountAfterPlatform.multiply(finalRate);
        BigDecimal finalKrwAmount = krwGrossAmount.subtract(networkFee);

        // 4. 원화 단위 반올림 처리 (정수)
        return finalKrwAmount.setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * 최종 적용 환율 계산
     */
    public BigDecimal calculateFinalRate(BigDecimal baseRate, BigDecimal spread, BigDecimal preferenceRate) {
        // 우대율 적용: spread * (1 - 0.9) = spread의 10%만 가산
        BigDecimal appliedSpread = spread.multiply(BigDecimal.ONE.subtract(preferenceRate));
        return baseRate.add(appliedSpread);
    }
}