package me.projectexledger.infrastructure.external.portone.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
public class PaymentItem {
    private String id;               // 포트원 결제 고유 ID
    private String merchantId;       // 가맹점(셀러) ID
    private AmountInfo amount;       // 결제 금액 정보
    private String status;           // 결제 상태 (PAID, FAILED 등)
    private OffsetDateTime paidAt;   // 결제 일시

    @Getter
    @NoArgsConstructor
    public static class AmountInfo {
        private BigDecimal total;    // 총 결제 금액
        private String currency;     // 통화 (KRW, USD 등)
    }
}