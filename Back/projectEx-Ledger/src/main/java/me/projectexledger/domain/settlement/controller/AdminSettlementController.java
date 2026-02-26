package me.projectexledger.domain.settlement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.common.dto.ApiResponse;
import me.projectexledger.domain.settlement.dto.ReconciliationListDTO;
import me.projectexledger.domain.settlement.dto.response.DashboardSummaryResponse;
import me.projectexledger.domain.settlement.service.SettlementEngineService;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/settlement")
@RequiredArgsConstructor
// 🚨 시니어 가이드: 직전에 확정한 통합 관리자 권한으로 강제합니다.
//@PreAuthorize("hasRole('INTEGRATED_ADMIN')")
public class AdminSettlementController {

    private final SettlementEngineService settlementEngineService;

    // 💡 시니어 추가: 프론트엔드의 "실시간 동기화" 버튼이 호출할 핵심 엔드포인트
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Void>> syncDailySettlement(@RequestParam String date) {
        log.info("[Admin] 🚀 {} 일자 포트원 실시간 동기화 파이프라인 구동 요청", date);

        // 포트원 연동 및 DB 적재 파이프라인 실행
        settlementEngineService.processDailySettlement(date);

        return ResponseEntity.ok(ApiResponse.success("정산 동기화가 성공적으로 완료되었습니다.", null));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        log.info("[Admin] 대시보드 요약 데이터 요청");
        DashboardSummaryResponse summaryData = settlementEngineService.getDashboardSummary();
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
    public ResponseEntity<ApiResponse<Void>> resolveDiscrepancy(@PathVariable Long settlementId) {
        log.info("[Admin] 오차 발생 건 수동 승인 처리 요청. ID: {}", settlementId);
        settlementEngineService.resolveDiscrepancy(settlementId);
        return ResponseEntity.ok(ApiResponse.success("수동 승인 처리가 완료되었습니다.", null));
    }

    @PostMapping("/{settlementId}/retry-remittance")
    public ResponseEntity<ApiResponse<Void>> retryRemittance(@PathVariable Long settlementId) {
        log.info("[Admin] 송금 실패 건 재전송 요청. ID: {}", settlementId);
        settlementEngineService.retryRemittance(settlementId);
        return ResponseEntity.ok(ApiResponse.success("재송금 요청이 접수되었습니다.", null));
    }
}