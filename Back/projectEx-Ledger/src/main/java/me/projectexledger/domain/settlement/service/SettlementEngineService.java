package me.projectexledger.domain.settlement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.admin.dto.DashboardSummaryDTO;
import me.projectexledger.domain.payment.repository.PaymentLogRepository;
import me.projectexledger.domain.settlement.api.PortOneClient;
import me.projectexledger.infrastructure.external.portone.dto.PortOnePaymentResponse;
import me.projectexledger.domain.settlement.dto.ReconciliationListDTO;
import me.projectexledger.domain.settlement.entity.RemittanceHistory;
import me.projectexledger.domain.settlement.repository.RemittanceHistoryRepository;
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

/**
 * Member A: [정산/송금 엔진 & 어드민 마스터] 핵심 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettlementEngineService {

    private final PaymentLogRepository paymentLogRepository;
    private final SettlementRepository settlementRepository;
    private final ExchangeRateCalculator exchangeRateCalculator;
    private final PortOneClient portOneClient;

    // 💡 1. 여기에 이력 저장소(Repository) 주입이 추가되었습니다!
    private final RemittanceHistoryRepository remittanceHistoryRepository;

    /**
     * [1. AdminDashboard] 전체 결제 합계 및 해외 송금 집행 현황 요약
     */
    public DashboardSummaryDTO getDashboardSummary() {
        log.info("[SettlementEngine] 실시간 대시보드 통계 집계 중...");

        BigDecimal totalAmount = settlementRepository.sumTotalSettlementAmountByStatus(SettlementStatus.COMPLETED);

        return DashboardSummaryDTO.builder()
                .totalPaymentAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO)
                .totalRemittanceCount(settlementRepository.count())
                .completedRemittanceCount(settlementRepository.countByStatus(SettlementStatus.COMPLETED))
                .pendingRemittanceCount(settlementRepository.countByStatus(SettlementStatus.PENDING))
                .failedRemittanceCount(settlementRepository.countByStatus(SettlementStatus.FAILED))
                .discrepancyCount(settlementRepository.countByStatus(SettlementStatus.DISCREPANCY))
                .build();
    }

    /**
     * [2. 정산 파이프라인] 포트원(V2) 결제 내역 동기화 및 환율 공식 적용
     */
    @Transactional
    public void processDailySettlement(String targetDate, String authToken) {
        log.info("[SettlementEngine] 🚀 {} 일자 포트원 API 데이터 동기화 시작", targetDate);

        PortOnePaymentResponse response = portOneClient.getPayments(authToken, targetDate, targetDate, 0, 100);

        BigDecimal baseRate = new BigDecimal("1350.50");
        BigDecimal spreadFee = new BigDecimal("10.00");
        BigDecimal preferredRate = new BigDecimal("0.90");

        response.items().forEach(item -> {
            if (settlementRepository.existsByOrderId(item.paymentId())) return;

            BigDecimal finalRate = exchangeRateCalculator.calculateFinalRate(baseRate, spreadFee, preferredRate);
            BigDecimal settlementAmount = exchangeRateCalculator.calculateSettlementAmount(item.amount(), finalRate);

            settlementRepository.save(Settlement.builder()
                    .orderId(item.paymentId())
                    .clientName(item.customer().name())
                    .amount(item.amount())
                    .baseRate(baseRate)
                    .spreadFee(spreadFee)
                    .preferredRate(preferredRate)
                    .finalAppliedRate(finalRate)
                    .settlementAmount(settlementAmount)
                    .status(SettlementStatus.PENDING)
                    .build());
        });
    }

    /**
     * [3. ReconciliationList] 외부 포트원 내역과 내부 송금 DB 대조 리스트
     */
    public List<ReconciliationListDTO> getReconciliationList(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Settlement> settlements = settlementRepository.findAll(pageable);

        return settlements.stream().map(settlement -> {
            String reconResult = paymentLogRepository.findByOrderId(settlement.getOrderId())
                    .map(log -> log.getAmount().compareTo(settlement.getAmount()) == 0 ? "MATCH" : "DISCREPANCY")
                    .orElse("MISSING_INTERNAL_LOG");

            return ReconciliationListDTO.builder()
                    .orderId(settlement.getOrderId())
                    .clientName(settlement.getClientName())
                    .amount(settlement.getAmount())
                    .status(settlement.getStatus().name())
                    .reconResult(reconResult)
                    .createdAt(settlement.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * [4. ReconciliationDetail] 오차 발생 건 수정 및 승인 처리
     */
    @Transactional
    public void resolveDiscrepancy(Long settlementId, BigDecimal correctedAmount, String reason) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("정산 건을 찾을 수 없습니다."));

        settlement.updateSettlementAmount(correctedAmount);
        settlement.markAsResolved(reason);
        log.info("[SettlementEngine] ✅ 오차 해결 완료: ID {}, 사유: {}", settlementId, reason);
    }

    /**
     * [5. RemittanceManagement] 자동 송금 실패 건 재전송 및 이력 관리
     */
    @Transactional
    public void retryRemittance(Long settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("재전송 대상이 없습니다."));

        log.info("[SettlementEngine] 💸 송금 재시도 실행: OrderId {}", settlement.getOrderId());

        try {
            // TODO: 실제 해외 송금 API 연동 로직
            settlement.updateStatus(SettlementStatus.COMPLETED);

            // 💡 2. 5번 메서드 수정: 성공 이력을 DB에 저장합니다!
            remittanceHistoryRepository.save(RemittanceHistory.builder()
                    .settlement(settlement)
                    .status("SUCCESS")
                    .attemptCount(2) // 예시: 2회차 시도 (실무에서는 카운트를 조회해서 +1 합니다)
                    .build());

        } catch (Exception e) {
            log.error("[SettlementEngine] ❌ 송금 재시도 실패: {}", e.getMessage());
            settlement.updateStatus(SettlementStatus.FAILED);

            // 💡 3. 5번 메서드 수정: 실패 이력도 에러 메시지와 함께 DB에 저장합니다!
            remittanceHistoryRepository.save(RemittanceHistory.builder()
                    .settlement(settlement)
                    .status("FAILED")
                    .errorMessage(e.getMessage())
                    .attemptCount(2)
                    .build());
        }
    }
}