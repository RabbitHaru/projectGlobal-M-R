package me.projectexledger.domain.settlement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.payment.entity.PaymentLog;
import me.projectexledger.domain.payment.repository.PaymentLogRepository;
import me.projectexledger.domain.settlement.dto.ReconciliationListDTO;
import me.projectexledger.domain.settlement.dto.response.DashboardSummaryResponse;
import me.projectexledger.domain.settlement.entity.Settlement;
import me.projectexledger.domain.settlement.entity.SettlementStatus;
import me.projectexledger.domain.settlement.repository.SettlementRepository;
import me.projectexledger.domain.settlement.util.ExchangeRateCalculator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettlementEngineService {

    private final PaymentLogRepository paymentLogRepository;
    private final SettlementRepository settlementRepository;
    private final ExchangeRateCalculator exchangeRateCalculator;

    /**
     * [대시보드] 요약 데이터 조회 (수정 완료)
     * Repository의 쿼리를 이용해 실제 DB 데이터를 집계하여 반환합니다.
     */
    public DashboardSummaryResponse getDashboardSummary() {
        log.info("[SettlementEngine] 대시보드 요약 데이터 계산 요청");

        // DB에서 실제 통계 데이터 조회
        BigDecimal totalAmount = settlementRepository.sumTotalSettlementAmountByStatus(SettlementStatus.COMPLETED);
        long pendingCount = settlementRepository.countByStatus(SettlementStatus.PENDING);

        return DashboardSummaryResponse.builder()
                .totalSettlementAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO) // null 방어
                .pendingCount((int) pendingCount)
                .build();
    }

    /**
     * [일일 정산 동기화] 기획서 공식 기반 환율 적용 및 DB 적재 파이프라인
     */
    @Transactional
    public void processDailySettlement(String date) {
        log.info("[SettlementEngine] 🚀 {} 일자 포트원 동기화 및 계산 파이프라인 시작", date);

        List<PortOneMockDto> externalPayments = fetchPaymentsFromPortOneMock(date);

        // 외부 API에서 가져올 매매기준율과 내부 설정값 (하드코딩 대신 추후 DB 조회로 변경)
        BigDecimal baseRate = new BigDecimal("1350.50");
        BigDecimal spreadFee = new BigDecimal("10.00");
        BigDecimal preferredRate = new BigDecimal("0.90");

        for (PortOneMockDto payment : externalPayments) {

            // 중복 방지 (멱등성)
            if (settlementRepository.existsByOrderId(payment.orderId())) {
                continue;
            }

            // 기획서 공식(최종적용환율 = 매매기준율 + (전산환전수수료 * (1 - 우대율))) 적용 계산
            BigDecimal finalAppliedRate = exchangeRateCalculator.calculateFinalRate(baseRate, spreadFee, preferredRate);
            BigDecimal settlementAmount = exchangeRateCalculator.calculateSettlementAmount(payment.amount(), finalAppliedRate);

            Settlement newSettlement = Settlement.builder()
                    .orderId(payment.orderId())
                    .clientName(payment.clientName())
                    .amount(payment.amount())
                    .baseRate(baseRate)
                    .spreadFee(spreadFee)
                    .preferredRate(preferredRate)
                    .finalAppliedRate(finalAppliedRate)
                    .settlementAmount(settlementAmount) // 최종 적용 금액
                    .status(SettlementStatus.COMPLETED)
                    .build();

            settlementRepository.save(newSettlement);
        }
        log.info("[SettlementEngine] ✅ 파이프라인 적재 완료");
    }

    // --- 이하 기존 유지 코드 (getReconciliationList 등) ---
    public List<ReconciliationListDTO> getReconciliationList(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentLog> paymentLogPage = paymentLogRepository.findAll(pageable);
        return paymentLogPage.stream()
                .map(log -> ReconciliationListDTO.builder()
                        .orderId(log.getOrderId())
                        .clientName(log.getClient() != null ? log.getClient().getName() : "미상")
                        .amount(log.getAmount())
                        .status(log.getStatus().name())
                        .reconResult("MATCH")
                        .createdAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void resolveDiscrepancy(Long settlementId) { /* TODO */ }

    @Transactional
    public void retryRemittance(Long settlementId) { /* TODO */ }

    // 임시 모의 데이터
    private record PortOneMockDto(String orderId, String clientName, BigDecimal amount) {}
    private List<PortOneMockDto> fetchPaymentsFromPortOneMock(String date) {
        return List.of(
                new PortOneMockDto("ORD-20260226-001", "스타벅스", new BigDecimal("100.00")),
                new PortOneMockDto("ORD-20260226-002", "나이키", new BigDecimal("50.00"))
        );
    }
}