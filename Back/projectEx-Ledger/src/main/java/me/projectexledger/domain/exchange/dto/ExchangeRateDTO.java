package me.projectexledger.domain.exchange.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateDTO {
    private String curUnit;
    private String curNm;
    private String provider;
    private String updatedAt;
    private BigDecimal rate;
    private BigDecimal changeAmount; // 전일 대비 등락액 (예: +12.5)
    private BigDecimal changeRate;   // 전일 대비 등락률 (예: 0.85)
}