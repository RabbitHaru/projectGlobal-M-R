package me.projectexledger.domain.settlement.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.projectexledger.domain.BaseEntity;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;

@Entity
@Table(name = "settlements", indexes = {
        // 대시보드 상태별 조회 최적화를 위한 복합 인덱스
        @Index(name = "idx_settlement_status_created", columnList = "status, created_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Settlement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. 포트원 대사 작업을 위한 필수 고유 키
    @Column(nullable = false, unique = true)
    private String orderId;

    @Column(nullable = false)
    private String clientName;

    // 2. 금액 정밀도(Precision) 제어: 부동소수점 오차 원천 차단
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount; // 원천 결제 금액

    // ==========================================
    // 🚨 기획서 정산 환율 공식 컴포넌트 필수 저장 (Audit 목적)
    // ==========================================
    @Column(name = "base_rate", nullable = false, precision = 19, scale = 4)
    private BigDecimal baseRate; //  매매기준율

    @Column(name = "spread_fee", nullable = false, precision = 19, scale = 4)
    private BigDecimal spreadFee; // 우리 서비스 마진 (전산 환전 수수료)

    @Column(name = "preferred_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal preferredRate; // 고객 우대율 (예: 90% = 0.9000)

    @Column(name = "final_applied_rate", nullable = false, precision = 19, scale = 4)
    private BigDecimal finalAppliedRate; // 최종 적용 환율
    // ==========================================

    @Column(nullable = false, precision = 19, scale = 0) // 원화는 소수점 절사
    private BigDecimal settlementAmount; // 수수료/환율 적용 후 최종 정산 금액

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SettlementStatus status;

    @Column(name = "resolution_reason", length = 500)
    private String resolutionReason;

    // @Builder 도입: 객체 생성 시점에 모든 데이터가 안전하게 세팅되도록 강제
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

    // 비즈니스 로직: 상태 전이
    public void markAsDiscrepancy() {
        this.status = SettlementStatus.DISCREPANCY;
    }
    public void markAsResolved(String reason) {
        this.status = SettlementStatus.COMPLETED;
        this.resolutionReason = reason;
    }
    public void updateSettlementAmount(BigDecimal correctedAmount) {
        this.settlementAmount = correctedAmount;
    }
    public void updateStatus(SettlementStatus newStatus) {
        this.status = newStatus;
    }
}