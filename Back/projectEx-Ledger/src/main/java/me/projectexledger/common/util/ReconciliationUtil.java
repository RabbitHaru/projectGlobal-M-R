package me.projectexledger.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ReconciliationUtil {

    /**
     * 내부 거래 내역과 외부(포트원) 결제 내역을 대조하여 오차를 찾아냅니다.
     * 시간 복잡도: O(N)
     */
    public void reconcile(List<InternalTxDto> internalData, List<ExternalTxDto> externalData) {

        // 1. 외부 데이터를 TransactionId를 Key로 하는 HashMap으로 변환 (탐색 속도 O(1))
        Map<String, ExternalTxDto> externalDataMap = externalData.stream()
                .collect(Collectors.toMap(ExternalTxDto::getTransactionId, ext -> ext));

        // 2. 내부 데이터를 순회하며 대조 작업 (전체 순회 O(N))
        for (InternalTxDto internal : internalData) {
            ExternalTxDto external = externalDataMap.get(internal.getTransactionId());

            if (external == null) {
                log.error("누락 발생: 포트원 측에 거래 내역이 없습니다. TX_ID: {}", internal.getTransactionId());
                // TODO: 오차 발생 상태로 변경 로직 호출
                continue;
            }

            // 금액 대조 (BigDecimal은 compareTo로 비교해야 정확함)
            if (internal.getAmount().compareTo(external.getAmount()) != 0) {
                log.error("금액 불일치: 내부 금액 {}, 외부 금액 {}. TX_ID: {}",
                        internal.getAmount(), external.getAmount(), internal.getTransactionId());
                // TODO: 오차 발생 상태로 변경 로직 호출
            } else {
                // 정상 정산 처리
                log.info("대조 일치: TX_ID: {}", internal.getTransactionId());
            }
        }
    }

    // 임시 DTO 클래스 (실제로는 분리)
    public interface InternalTxDto { String getTransactionId(); BigDecimal getAmount(); }
    public interface ExternalTxDto { String getTransactionId(); BigDecimal getAmount(); }
}