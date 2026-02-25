package me.projectexledger.domain.settlement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.common.util.ReconciliationUtil;
import me.projectexledger.domain.settlement.api.PortOneClient;
import me.projectexledger.domain.settlement.entity.Settlement;
import me.projectexledger.domain.settlement.entity.SettlementStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final PortOneClient portOneClient;
    private final ReconciliationUtil reconciliationUtil;

    /**
     * Batch의 ItemProcessor 단계에서 호출되는 핵심 정산 엔진입니다.
     * 트랜잭션을 걸어, 도중에 실패하면 이 뭉치(Chunk) 전체가 롤백되도록 안전장치를 둡니다.
     */
    @Transactional
    public Settlement processSingleSettlement(Settlement pendingSettlement) {
        // 1. 오늘 날짜 기준으로 포트원 데이터 조회 (실제로는 Batch Step 시작 시 한 번만 캐싱해두는 것이 성능에 좋습니다)
        String today = LocalDate.now().toString();
        List<PortOneClient.PortOneTxDto> externalDataList = portOneClient.fetchCompletedPayments(today);

        // 2. O(N) 검증을 위해 외부 데이터를 Map으로 변환
        Map<String, BigDecimal> portOneDataMap = externalDataList.stream()
                .collect(Collectors.toMap(
                        PortOneClient.PortOneTxDto::transactionId,
                        PortOneClient.PortOneTxDto::amount,
                        (existing, replacement) -> existing // 중복 키 발생 시 기존 값 유지
                ));

        // 3. 무결성 대조 실행 (ReconciliationUtil에게 위임)
        log.debug("정산 대조 시작 - TX_ID: {}", pendingSettlement.getTransactionId());
        Settlement processedData = reconciliationUtil.verifyAndProcess(pendingSettlement, portOneDataMap);

        // 4. 위험 감지 시 알림
        if (processedData.getStatus() == SettlementStatus.DISCREPANCY) {
            log.error("🚨 [긴급] 정산 오차 발견! 즉시 확인 요망. TX_ID: {}", processedData.getTransactionId());
            // TODO: 슬랙(Slack)이나 이메일로 관리자에게 즉시 알람을 쏘는 로직 추가
        }

        return processedData;
    }
}