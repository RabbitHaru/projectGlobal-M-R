package me.projectexledger.domain.settlement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.common.dto.ApiResponse;
import me.projectexledger.domain.admin.dto.DashboardSummaryDTO; // 🚨 수정 1: A님의 훌륭한 DTO로 임포트 변경
import me.projectexledger.domain.settlement.dto.ReconciliationListDTO;
import me.projectexledger.domain.settlement.dto.SettlementPolicyUpdateRequest;
import me.projectexledger.domain.settlement.service.SettlementEngineService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/settlement")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('INTEGRATED_ADMIN')") // 권한 설정 임시 주석 처리
public class AdminSettlementController {

    private final SettlementEngineService settlementEngineService;

    // 💡 포트원 API 시크릿 키를 application.properties에서 가져옵니다.
    @Value("${portone.api.secret}")
    private String portOneSecret;

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Void>> syncDailySettlement(@RequestParam String date) {
        log.info("[Admin] 🚀 {} 일자 포트원 실시간 동기화 파이프라인 구동 요청", date);

        // 포트원 인증 토큰(authToken)을 만들어서 엔진에 같이 넘겨줍니다.
        String authToken = "PortOne " + portOneSecret;
        settlementEngineService.processDailySettlement(date, authToken);

        return ResponseEntity.ok(ApiResponse.success("정산 동기화가 성공적으로 완료되었습니다.", null));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getDashboardSummary() {
        // 리턴 타입을 DashboardSummaryDTO로 교체
        log.info("[Admin] 대시보드 요약 데이터 요청");
        DashboardSummaryDTO summaryData = settlementEngineService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("대시보드 데이터 조회 성공", summaryData));
    }

    @GetMapping("/reconciliations")
    public ResponseEntity<ApiResponse<List<ReconciliationListDTO>>> getReconciliationList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("[Admin] 대사 리스트 조회 요청. Page: {}, Size: {}", page, size);
        List<ReconciliationListDTO> data = settlementEngineService.getReconciliationList(page, size);
        return ResponseEntity.ok(ApiResponse.success("리스트 조회 성공", data));
    }

    @PostMapping("/{settlementId}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveDiscrepancy(
            @PathVariable Long settlementId,
            @RequestParam BigDecimal correctedAmount, // 수정할 금액 파라미터 추가
            @RequestParam String reason) {            // 오차 사유 파라미터 추가

        log.info("[Admin] 오차 발생 건 수동 승인 처리 요청. ID: {}", settlementId);
        settlementEngineService.resolveDiscrepancy(settlementId, correctedAmount, reason);
        return ResponseEntity.ok(ApiResponse.success("수동 승인 처리가 완료되었습니다.", null));
    }

    @PostMapping("/{settlementId}/retry-remittance")
    public ResponseEntity<ApiResponse<Void>> retryRemittance(@PathVariable Long settlementId) {
        log.info("[Admin] 송금 실패 건 재전송 요청. ID: {}", settlementId);
        settlementEngineService.retryRemittance(settlementId);
        return ResponseEntity.ok(ApiResponse.success("재송금 요청이 접수되었습니다.", null));
    }

    @PostMapping("/policy/{merchantId}")
    public ResponseEntity<ApiResponse<Void>> updateSettlementPolicy(
            @PathVariable String merchantId,
            @RequestBody SettlementPolicyUpdateRequest request) {
        log.info("[Admin] {} 가맹점의 정산 수수료 정책 업데이트 요청", merchantId);
        return ResponseEntity.ok(ApiResponse.success("수수료 정책이 성공적으로 반영되었습니다.", null));
    }
}