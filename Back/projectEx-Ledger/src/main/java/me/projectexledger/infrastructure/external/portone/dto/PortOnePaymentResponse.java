package me.projectexledger.infrastructure.external.portone.dto;

import lombok.Builder;
import java.math.BigDecimal;
import java.util.List;

/**
 * 포트원 V2 결제 내역 조회 응답 DTO
 */
@Builder
public record PortOnePaymentResponse(
        List<PortOnePaymentData> items,
        PageInfo page
) {
    public record PortOnePaymentData(
            String paymentId,      // 포트원 결제 고유 ID (우리 쪽 orderId와 매핑)
            BigDecimal amount,     // 결제 금액 (BigDecimal 필수)
            String currency,       // 통화 (USD, KRW 등)
            String status,         // 결제 상태
            String requestedAt,    // 결제 요청 시각
            CustomerInfo customer  // 가맹점/고객 정보
    ) {}

    public record CustomerInfo(
            String name,
            String email
    ) {}

    public record PageInfo(
            int totalCount,
            int page,
            int size
    ) {}
}