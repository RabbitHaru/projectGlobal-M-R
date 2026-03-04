package me.projectexledger.domain.remittance.service;

import lombok.RequiredArgsConstructor;
import me.projectexledger.domain.remittance.dto.FeeDTO;
import me.projectexledger.domain.remittance.dto.RemittanceDTO;
import me.projectexledger.domain.remittance.entity.Remittance;
import me.projectexledger.domain.remittance.entity.RemittanceStatus;
import me.projectexledger.domain.remittance.repository.RemittanceRepository;
import me.projectexledger.domain.exchange.service.CurrencyCalculator; // 👈 계산기 의존성 추가!

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RemittanceService {

    private final RemittanceRepository remittanceRepository;
    private final CurrencyCalculator currencyCalculator; // 👈 정산 엔진과 동일하게 계산기 주입!

    @Transactional
    public RemittanceDTO.Response processRemittanceRequest(String requesterId, RemittanceDTO.Request requestDTO) {

        // 1. 엔티티 생성 및 DB 저장 (요청 DTO -> 엔티티 매핑)
        Remittance remittance = Remittance.builder()
                .requesterId(requesterId)
                .receiverName(requestDTO.getRecipientName())
                .receiverBank(requestDTO.getRecipientBank())
                .receiverAccount(requestDTO.getRecipientAccount())
                .currency(requestDTO.getCurrency())
                .foreignCurrencyAmount(requestDTO.getAmount())
                .exchangeRate(requestDTO.getExchangeRate())
                .remittanceFee(requestDTO.getFeeAmount())
                .krwAmount(requestDTO.getTotalPayment())
                .status(RemittanceStatus.REQUESTED) // 초기 상태: REQUESTED
                .build();

        remittanceRepository.save(remittance);

        // 2. 고유 거래 번호 생성 (예: TRX_20260304_랜덤값)
        String transactionId = "TRX_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "_" + UUID.randomUUID().toString().substring(0, 8);

        // 3. 응답 DTO 반환
        return RemittanceDTO.Response.builder()
                .transactionId(transactionId)
                .status(remittance.getStatus().name())
                .requestedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }

    // 💸 송금 수수료 및 환율 우대 통합 계산 로직
    public FeeDTO.Response calculateRemittanceFee(BigDecimal foreignAmount, BigDecimal baseRate, String clientGrade) {

        BigDecimal spread = new BigDecimal("20.0"); // 은행 스프레드 (달러당 20원 마진 가정)

        BigDecimal preferenceRate;
        BigDecimal telegraphicFee; // 전신료
        BigDecimal processingFeeRate;  // 송금 비율 수수료

        // 👑 1. 고객 등급별 수익 정책 설정 (A님의 최종 결정!)
        if ("VIP".equalsIgnoreCase(clientGrade) || (clientGrade != null && clientGrade.contains("기업"))) {
            preferenceRate = new BigDecimal("1.00");     // VIP: 환율 우대 100% (마진 0원)
            telegraphicFee = BigDecimal.ZERO;            // VIP: 전신료 무료
            processingFeeRate = new BigDecimal("0.003"); // VIP: 수수료 0.3% (0.2%에서 상향 조정!)
        } else {
            preferenceRate = new BigDecimal("0.90");     // 일반: 환율 우대 90%
            telegraphicFee = new BigDecimal("3000");     // 일반: 전신료 3,000원
            processingFeeRate = new BigDecimal("0.005"); // 일반: 수수료 0.5%
            // 🚨 기존에 있던 상한선(30,000원) 코드를 완전히 삭제했습니다! (고액 송금 수익 무제한)
        }

        // 2. CurrencyCalculator를 이용해 우대율이 반영된 '최종 환율' 계산
        BigDecimal finalAppliedRate = currencyCalculator.calculateFinalRate(baseRate, spread, preferenceRate);

        // 3. 순수 환전 금액 계산 (외화 * 최종 환율)
        BigDecimal baseKrwAmount = foreignAmount.multiply(finalAppliedRate).setScale(0, RoundingMode.HALF_UP);

        // 4. 수수료 계산 (상한선 없이 금액에 비례하여 징수!)
        BigDecimal processingFee = baseKrwAmount.multiply(processingFeeRate).setScale(0, RoundingMode.HALF_UP);

        // 5. 총 수수료 및 최종 결제 금액 합산
        BigDecimal totalFeeAmount = telegraphicFee.add(processingFee);
        BigDecimal totalPayment = baseKrwAmount.add(totalFeeAmount);

        return FeeDTO.Response.builder()
                .baseKrwAmount(baseKrwAmount)
                .telegraphicFee(telegraphicFee)
                .processingFee(processingFee)
                .totalFeeAmount(totalFeeAmount)
                .totalPayment(totalPayment)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RemittanceDTO.ListResponse> getAllRemittances() {

        // JpaRepository에서 기본 제공하는 findAll 활용 (혹은 별도 정의한 메서드)
        return remittanceRepository.findAll().stream()
                // 최신순 정렬 (ID 내림차순)
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .map(remittance -> RemittanceDTO.ListResponse.builder()
                        .id(remittance.getId())
                        .requesterId(remittance.getRequesterId())
                        .receiverName(remittance.getReceiverName())
                        .krwAmount(remittance.getKrwAmount())
                        .foreignCurrencyAmount(remittance.getForeignCurrencyAmount())
                        .currency(remittance.getCurrency())
                        .status(remittance.getStatus().name())
                        // BaseEntity의 createdAt을 포맷팅 (null 체크 포함)
                        .requestedAt(remittance.getCreatedAt() != null ?
                                remittance.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "-")
                        .build())
                .collect(Collectors.toList());
    }
}