package me.projectexledger.domain.settlement.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.projectexledger.common.util.ReconciliationUtil; //
import me.projectexledger.domain.BaseEntity; //
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;

@Entity
@Table(name = "settlements", indexes = {
        @Index(name = "idx_settlement_status_created", columnList = "status, created_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)

public class Settlement extends BaseEntity implements ReconciliationUtil.InternalTxDto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderId; // 포트원 대사 작업을 위한 고유 키

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount; // 원천 결제 금액

    // 기획서 정산 환율 공식 컴포넌트 (Audit 목적 저장)
    @Column(name = "base_rate", nullable = false, precision = 19, scale = 4)
    private BigDecimal baseRate; // 매매기준율

    @Column(name = "spread_fee", nullable = false, precision = 19, scale = 4)
    private BigDecimal spreadFee; // 서비스 마진

    @Column(name = "preferred_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal preferredRate; // 고객 우대율

    @Column(name = "final_applied_rate", nullable = false, precision = 19, scale = 4)
    private BigDecimal finalAppliedRate; // 최종 적용 환율

    @Column(nullable = false, precision = 19, scale = 0)
    private BigDecimal settlementAmount; // 최종 정산 금액 (KRW 절사)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SettlementStatus status;

    @Column(name = "resolution_reason", length = 500)
    private String resolutionReason;

    @Builder
    public Settlement(String orderId, String clientName, BigDecimal amount,
                      BigDecimal baseRate, BigDecimal spreadFee, BigDecimal preferredRate,
                      BigDecimal finalAppliedRate, BigDecimal settlementAmount, SettlementStatus status) {
        this.orderId = orderId;
        this.clientName = clientName;
        this.amount = amount;
        this.baseRate = baseRate;
        this.spreadFee = spreadFee;
        this.preferredRate = preferredRate;
        this.finalAppliedRate = finalAppliedRate;
        this.settlementAmount = settlementAmount;
        this.status = status;
    }

    // ReconciliationUtil 인터페이스 구현 메서드
    @Override
    public String getTransactionId() {
        return this.orderId; // 유틸리티가 찾는 ID를 orderId로 매핑
    }

    @Override
    public BigDecimal getAmount() {
        return this.amount; //
    }

    // 비즈니스 로직 및 상태 전이 (에러 해결 포인트)
    public void markAsCompleted() {
        this.status = SettlementStatus.COMPLETED;
    }

    public void markAsDiscrepancy() {
        this.status = SettlementStatus.DISCREPANCY; //
    }

    public void markAsResolved(String reason) {
        this.status = SettlementStatus.COMPLETED; //
        this.resolutionReason = reason; //
    }

    public void updateSettlementAmount(BigDecimal correctedAmount) {
        this.settlementAmount = correctedAmount; //
    }

    public void updateStatus(SettlementStatus newStatus) {
        this.status = newStatus; //
    }
}