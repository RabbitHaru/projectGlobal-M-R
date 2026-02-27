package me.projectexledger.domain.exchange.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_rates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String curUnit;   // 통화 코드 (예: USD)

    @Column(nullable = false)
    private String curNm;     // 통화명

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal rate;  // 매매 기준율

    @Column(nullable = false)
    private String provider;  // 출처 (KOREAEXIM / FRANKFURTER)

    @Column(nullable = false)
    private LocalDateTime updatedAt; // 고시 시간
}