package me.projectexledger.domain.settlement.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "settlements")
public class Settlement { // BaseEntity 상속은 생략 (B가 구현 예정)

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String transactionId; // 우리 DB의 고유 거래 번호

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency; // KRW, USD 등

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettlementStatus status;

    @Builder
    public Settlement(String transactionId, BigDecimal amount, String currency, SettlementStatus status) {
        this.transactionId = transactionId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
    }

    // 상태 변경 비즈니스 로직
    public void markAsCompleted() {
        this.status = SettlementStatus.COMPLETED;
    }

    public void markAsDiscrepancy() {
        this.status = SettlementStatus.DISCREPANCY;
    }
}