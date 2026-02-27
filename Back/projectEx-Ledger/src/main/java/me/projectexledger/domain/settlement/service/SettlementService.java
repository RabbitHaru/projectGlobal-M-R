package me.projectexledger.domain.settlement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.common.util.ReconciliationUtil;
import me.projectexledger.domain.settlement.api.PortOneClient;
import me.projectexledger.domain.settlement.entity.Settlement;
import me.projectexledger.domain.settlement.entity.SettlementStatus;
import me.projectexledger.domain.settlement.repository.SettlementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final PortOneClient portOneClient;
    private final ReconciliationUtil reconciliationUtil;

    /**
     * 대량의 금융 데이터를 처리하고 무결성을 검증합니다.
     */
    @Transactional
    public void processDailySettlement(String targetDate) {
        log.info("🚀 {} 일자 대량 정산 검증 프로세스를 시작합니다.", targetDate);

        // 1. 내부 DB에서 '송금 대기' 상태인 정산 대상 데이터 조회
        // (SettlementStatus.PENDING은 '송금 대기'를 의미합니다)
        List<Settlement> pendingSettlements = settlementRepository.findByStatus(SettlementStatus.PENDING);

        if (pendingSettlements.isEmpty()) {
            log.info("정산할 데이터가 없습니다.");
            return;
        }

        // 2. 포트원 V2 API를 연동하여 서버 사이드에서 결제/송금 완료 내역 조회
        List<PortOneClient.PortOneTxDto> externalPayments = portOneClient.fetchCompletedPayments(targetDate);

        // 3. 내부 데이터를 ReconciliationUtil이 이해할 수 있는 InternalTxDto 인터페이스로 어댑팅
        List<ReconciliationUtil.InternalTxDto> internalDataList = pendingSettlements.stream()
                .map(settlement -> new ReconciliationUtil.InternalTxDto() {
                    @Override
                    public String getTransactionId() {
                        return settlement.getTransactionId();
                    }

                    @Override
                    public BigDecimal getAmount() {
                        return settlement.getAmount();
                    }
                })
                .collect(Collectors.toList());

        // 4. 외부 데이터를 ReconciliationUtil이 이해할 수 있는 ExternalTxDto 인터페이스로 어댑팅
        List<ReconciliationUtil.ExternalTxDto> externalDataList = externalPayments.stream()
                .map(ext -> new ReconciliationUtil.ExternalTxDto() {
                    @Override
                    public String getTransactionId() {
                        return ext.transactionId();
                    }

                    @Override
                    public BigDecimal getAmount() {
                        return ext.amount();
                    }
                })
                .collect(Collectors.toList());

        // 5. O(N) 속도의 핵심 정산 대조 알고리즘 실행
        log.info("📊 총 {}건의 내부 데이터와 {}건의 외부 데이터 대조를 시작합니다.", internalDataList.size(), externalDataList.size());
        reconciliationUtil.reconcile(internalDataList, externalDataList);

        // 6. 상태 업데이트 반영 로직
        // (ReconciliationUtil에서 직접 엔티티를 수정하도록 변경하거나,
        // 대조 결과를 반환받아 여기서 일괄 update 처리를 진행하면 됩니다.)
        log.info("✅ 일일 정산 검증 프로세스 완료.");
    }
}