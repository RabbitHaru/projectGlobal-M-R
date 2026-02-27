package me.projectexledger.domain.client.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import me.projectexledger.domain.BaseEntity;

/**
 * 기업 고객(클라이언트) 정보 및 수수료 정책 관리 엔티티
 * 이 정보는 나중에 정산 엔진이 수수료를 계산할 때 '기준 데이터'가 됩니다.
 */
@Entity
@Table(name = "clients")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Client extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;              // 기업명 (예: (주)엑스레저)

    @Column(nullable = false, unique = true)
    private String businessNumber;    // 사업자번호 (Member B의 검증 대상)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClientStatus status;      // 가입 상태: PENDING, APPROVED, REJECTED

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal feeRate;       // 수수료율

    // 가입 승인 로직
    public void approve() {
        this.status = ClientStatus.APPROVED;
    }

    // 수수료율 업데이트 로직 (관리자 기능)
    public void updateFeeRate(BigDecimal newRate) {
        this.feeRate = newRate;
    }
}