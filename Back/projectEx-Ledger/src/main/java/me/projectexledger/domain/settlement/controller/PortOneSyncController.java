package me.projectexledger.domain.settlement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.settlement.service.SettlementEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin/portone")
@RequiredArgsConstructor
public class PortOneSyncController {

    // 💡 이제 컨트롤러가 포트원 클라이언트를 직접 부를 필요가 없습니다! 정산 엔진(Service)만 있으면 됩니다.
    private final SettlementEngineService settlementService;

    /**
     * [실전용 API] 어드민 대시보드에서 '동기화' 버튼 클릭 시 작동
     * 포트원 데이터 긁어오기 + DB 금액 대조 + COMPLETED 상태 업데이트를 한 방에 처리합니다.
     */
    @PostMapping("/sync")
    public ResponseEntity<?> syncVirtualAccountPayments(
            @RequestParam(defaultValue = "2026-02-26") String date) {

        log.info("🔄 [관리자 요청] {} 일자 데이터 동기화 및 대사 작업을 시작합니다...", date);

        try {
            // 정산 엔진 가동! (긁어오기부터 DB 업데이트까지 여기서 다 일어납니다)
            settlementService.processDailySettlement(date);

            // 프론트엔드 화면(어드민)에 성공 메시지를 보냅니다.
            return ResponseEntity.ok("✅ " + date + " 일자 포트원 동기화 및 정산 대조가 성공적으로 완료되었습니다.");

        } catch (Exception e) {
            log.error("🚨 동기화 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("동기화 실패: 백엔드 로그를 확인하세요.");
        }
    }
}