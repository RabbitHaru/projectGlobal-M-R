package me.projectexledger.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class DashboardSummaryDTO {
    private BigDecimal totalPaymentAmount;    // 전체 결제 합계
    private long totalRemittanceCount;        // 전체 송금 건수
    private long completedRemittanceCount;    // 송금 완료 건수
    private long pendingRemittanceCount;      // 송금 대기 건수
    private long failedRemittanceCount;       // 송금 실패 건수
    private long discrepancyCount;            // 대사 오차 발생 건수
}