package me.projectexledger;

import me.projectexledger.domain.settlement.util.ExchangeRateCalculator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 정산 엔진 코어 비즈니스 로직 검증 테스트
 * - 기획서의 환율 공식 및 원화 단위 반올림 정책을 검증합니다.
 */
class ExchangeRateCalculatorTest {

    // 테스트할 대상 객체 (우리가 만든 계산기)
    private final ExchangeRateCalculator calculator = new ExchangeRateCalculator();

    @Test
    @DisplayName("기획서 검증 1: 90% 우대율 적용 시 수수료의 10%만 가산되어야 한다")
    void calculateFinalRate_90PercentPreferred() {
        // Given (준비: 기획서 상황 가정)
        BigDecimal baseRate = new BigDecimal("1300.0000");   // 매매기준율: 1300원
        BigDecimal spreadFee = new BigDecimal("10.0000");    // 전산환전수수료: 10원
        BigDecimal preferredRate = new BigDecimal("0.9000"); // 고객 우대율: 90%

        // When (실행: 우리 시스템의 계산기 작동)
        BigDecimal finalRate = calculator.calculateFinalRate(baseRate, spreadFee, preferredRate);

        // Then (검증: 1300 + (10 * (1 - 0.90)) = 1300 + 1 = 1301원)
        // isEqualByComparingTo는 1301.0과 1301.0000 같은 소수점 스케일 차이까지 똑똑하게 무시하고 수학적 값만 비교합니다.
        assertThat(finalRate).isEqualByComparingTo(new BigDecimal("1301.0000"));
    }

    @Test
    @DisplayName("기획서 검증 2: 우대율이 0%일 경우 수수료 전액(100%)이 가산되어야 한다")
    void calculateFinalRate_0PercentPreferred() {
        // Given
        BigDecimal baseRate = new BigDecimal("1300.0000");
        BigDecimal spreadFee = new BigDecimal("10.0000");
        BigDecimal preferredRate = new BigDecimal("0.0000"); // 우대 없음 (0%)

        // When
        BigDecimal finalRate = calculator.calculateFinalRate(baseRate, spreadFee, preferredRate);

        // Then (1300 + 10 = 1310원)
        assertThat(finalRate).isEqualByComparingTo(new BigDecimal("1310.0000"));
    }

    @Test
    @DisplayName("정산 금액 검증: 외화 원천 금액 * 최종 환율 (원화는 소수점 이하 반올림 처리)")
    void calculateSettlementAmount() {
        // Given
        BigDecimal originalAmount = new BigDecimal("100.50"); // 외화 결제 원금: 100.50 달러
        BigDecimal finalRate = new BigDecimal("1301.0000");   // 적용된 최종 환율: 1301원

        // When
        BigDecimal settlementAmount = calculator.calculateSettlementAmount(originalAmount, finalRate);

        // Then (100.50 * 1301 = 130750.5 -> 원화 규정에 따라 반올림하면 130751원)
        assertThat(settlementAmount).isEqualByComparingTo(new BigDecimal("130751"));
    }
}