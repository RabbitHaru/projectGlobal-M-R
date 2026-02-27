package me.projectexledger.domain.exchange.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "exchange_rates",
        indexes = {
                // 그래프 조회를 위해 통화 코드와 고시 시간 순으로 복합 인덱스 구성
                @Index(name = "idx_cur_unit_updated_at", columnList = "curUnit, updatedAt")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10) // 통화 코드 길이를 명시적으로 제한
    private String curUnit;

    @Column(nullable = false, length = 50)
    private String curNm;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal rate;

    @Column(nullable = false, length = 20)
    private String provider;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}