package me.projectexledger.domain.exchange.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateDto {
    private String curUnit;      // 통화 코드 (예: USD)
    private String curNm;        // 통화명
    private BigDecimal rate;     // 환율 (정밀도 계산을 위해 BigDecimal 사용)
    private String provider;     // 출처
    private LocalDateTime updatedAt; // 업데이트 시간
}