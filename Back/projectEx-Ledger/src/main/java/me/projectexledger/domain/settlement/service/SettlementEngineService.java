package me.projectexledger.domain.settlement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.admin.dto.DashboardSummaryDTO;
import me.projectexledger.domain.payment.repository.PaymentLogRepository;
import me.projectexledger.domain.settlement.api.PortOneClient;
import me.projectexledger.portone.Response.PortOnePaymentResponse;
import me.projectexledger.domain.settlement.dto.ReconciliationListDTO;
import me.projectexledger.domain.settlement.entity.RemittanceHistory;
import me.projectexledger.domain.settlement.repository.RemittanceHistoryRepository;
import me.projectexledger.domain.settlement.entity.Settlement;
import me.projectexledger.domain.settlement.entity.SettlementStatus;
import me.projectexledger.domain.settlement.repository.SettlementRepository;
import me.projectexledger.domain.settlement.util.ExchangeRateCalculator;
import me.projectexledger.domain.exchange.service.CurrencyCalculator;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
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
    private final PortOneClient portOneClient;
    private final RemittanceHistoryRepository remittanceHistoryRepository;
    private final CurrencyCalculator currencyCalculator;

    public DashboardSummaryDTO getDashboardSummary() {
        BigDecimal totalAmount = settlementRepository.sumTotalSettlementAmountByStatus(SettlementStatus.COMPLETED);
        return DashboardSummaryDTO.builder()
                .totalPaymentAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO)
                .totalRemittanceCount(settlementRepository.count())
                .completedRemittanceCount(settlementRepository.countByStatus(SettlementStatus.COMPLETED))
                .pendingRemittanceCount(settlementRepository.countByStatus(SettlementStatus.PENDING))
                .failedRemittanceCount(settlementRepository.countByStatus(SettlementStatus.FAILED))
                .discrepancyCount(settlementRepository.countByStatus(SettlementStatus.DISCREPANCY))
                .inProgressRemittanceCount(settlementRepository.countByStatus(SettlementStatus.IN_PROGRESS))
                .waitingRemittanceCount(settlementRepository.countByStatus(SettlementStatus.WAITING))
                .build();
    }

    @Transactional
    public void processDailySettlement(String targetDate) {
        log.info("[Settlement] {} 일자 포트원 정산 데이터 동기화 시작", targetDate);
        PortOnePaymentResponse response = portOneClient.getPayments(targetDate, targetDate, 0, 100);

        BigDecimal liveUsdRate = exchangeRateCalculator.getUsdExchangeRate();
        log.info("[Settlement] 오늘자 실시간 USD 환율 적용: {}원", liveUsdRate);

        BigDecimal networkFee = new BigDecimal("2000");       // 네트워크 고정비 2,000원 공통
        BigDecimal spread = new BigDecimal("20.0");           // 은행 스프레드 (달러당 20원 마진 가정)

        response.getItems().forEach(item -> {
            if (settlementRepository.existsByOrderId(item.getId())) return;

            String clientName = (item.getCustomer() != null && item.getCustomer().getName() != null)
                    ? item.getCustomer().getName() : "익명 고객";

            // 👑 VIP 판별 로직 (이름에 VIP/기업 포함 여부로 임시 구분)
            boolean isVip = clientName.toUpperCase().contains("VIP") || clientName.contains("기업");

            BigDecimal platformFeeRate;
            BigDecimal preferenceRate;

            // 💰 A님의 최종 수수료 정책 적용
            if (isVip) {
                platformFeeRate = new BigDecimal("0.010"); // VIP: 플랫폼 수수료 1.0%
                preferenceRate = new BigDecimal("1.00");   // VIP: 환율 우대 100% (마진 0)
                log.info("[Settlement] 👑 VIP 적용: {} (수수료 1%, 우대 100%)", clientName);
            } else {
                platformFeeRate = new BigDecimal("0.015"); // 일반: 플랫폼 수수료 1.5%
                preferenceRate = new BigDecimal("0.90");   // 일반: 환율 우대 90%
                log.info("[Settlement] 🥉 일반 적용: {} (수수료 1.5%, 우대 90%)", clientName);
            }

            BigDecimal totalAmount = item.getAmount().getTotal();
            String currency = item.getCurrency();
            BigDecimal settlementAmount = totalAmount; // 기본값
            BigDecimal finalAppliedRate = liveUsdRate;

            if ("USD".equalsIgnoreCase(currency)) {
                // 수익 창출 계산기 적용
                settlementAmount = currencyCalculator.calculateFinalSettlementAmount(
                        totalAmount, liveUsdRate, platformFeeRate, networkFee, spread, preferenceRate
                );

                // 적용된 최종 환율 계산
                finalAppliedRate = currencyCalculator.calculateFinalRate(liveUsdRate, spread, preferenceRate);

                log.info("[Settlement] 수수료 적용 완료: {} USD -> {} KRW (주문번호: {})", totalAmount, settlementAmount, item.getId());
            }

            settlementRepository.save(Settlement.builder()
                    .orderId(item.getId())
                    .transactionId(item.getId())
                    .clientName(clientName)
                    .amount(totalAmount)
                    .currency(currency)
                    .settlementAmount(settlementAmount)
                    .baseRate(liveUsdRate)
                    .finalAppliedRate(finalAppliedRate)
                    .preferredRate(preferenceRate)
                    .spreadFee(spread)
                    .status(SettlementStatus.PENDING)
                    .build());
        });
        log.info("[Settlement] 정산 데이터 동기화 완료");
    }

    public List<ReconciliationListDTO> getReconciliationList(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Settlement> settlements = settlementRepository.findAll(pageable);

        return settlements.stream().map(s -> ReconciliationListDTO.builder()
                .id(s.getId())
                .orderId(s.getOrderId())
                .clientName(s.getClientName())
                .originalAmount(s.getAmount())
                .settlementAmount(s.getSettlementAmount())
                .status(s.getStatus().name())
                .updatedAt(s.getUpdatedAt() != null ?
                        s.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "")
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public void resolveDiscrepancy(Long settlementId, BigDecimal correctedAmount, String reason) {
        Settlement settlement = settlementRepository.findById(settlementId).orElseThrow();
        settlement.updateSettlementAmount(correctedAmount);
        settlement.markAsResolved(reason);
    }

    @Transactional
    public void retryRemittance(Long settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId).orElseThrow();
        try {
            settlement.updateStatus(SettlementStatus.COMPLETED);
            remittanceHistoryRepository.save(RemittanceHistory.builder().settlement(settlement).status("SUCCESS").attemptCount(2).build());
        } catch (Exception e) {
            settlement.updateStatus(SettlementStatus.FAILED);
            remittanceHistoryRepository.save(RemittanceHistory.builder().settlement(settlement).status("FAILED").errorMessage(e.getMessage()).attemptCount(2).build());
        }
    }

    @Transactional
    public void createTestSettlement(String orderId, String clientName, BigDecimal amount, String currency, SettlementStatus status) {
        settlementRepository.save(Settlement.builder()
                .orderId(orderId)
                .transactionId("TX-" + System.currentTimeMillis())
                .clientName(clientName)
                .amount(amount)
                .currency(currency)
                .settlementAmount(amount)
                .baseRate(BigDecimal.ONE)
                .finalAppliedRate(BigDecimal.ONE)
                .preferredRate(BigDecimal.ZERO)
                .spreadFee(BigDecimal.ZERO)
                .status(status)
                .build());
        log.info("[Test] 테스트 결제 데이터 저장 완료: {}", orderId);
    }
}