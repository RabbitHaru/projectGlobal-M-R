package me.projectexledger.domain.client.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.common.dto.ApiResponse;
import me.projectexledger.domain.client.dto.ClientPendingDTO;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/clients")
@RequiredArgsConstructor
// [임시 조치] 프론트엔드 연동 및 UI 테스트를 위해 보안 검증 임시 해제
// TODO: (Spring Security 도입 시) 아래 주석 반드시 해제하여 관리자 권한 강제할 것
// @PreAuthorize("hasRole('ADMIN')")
public class AdminClientController {

    // [ClientManagement.tsx 용] 기업 고객 가입 승인 대기 리스트 조회
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ClientPendingDTO>>> getPendingClients() {
        log.info("가입 승인 대기 중인 기업 고객 리스트 조회");

        // TODO: 실제 Service 계층 호출
        List<ClientPendingDTO> mockList = Collections.emptyList();

        // 와일드카드 <?> 대신 명확한 ApiResponse 래핑 구조 사용
        return ResponseEntity.ok(ApiResponse.success("승인 대기 리스트 조회 성공", mockList));
    }

    // [ClientManagement.tsx 용] 특정 기업 고객 가입 승인 처리
    @PostMapping("/{clientId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveClient(@PathVariable Long clientId) {
        log.info("기업 고객 가입 승인. ID: {}", clientId);

        // TODO: clientService.approveClient(clientId);

        return ResponseEntity.ok(ApiResponse.success("고객 승인이 완료되었습니다.", null));
    }

    // [ClientManagement.tsx 용] 기업 고객 등급별 수수료 설정
    @PatchMapping("/{clientId}/fee")
    public ResponseEntity<ApiResponse<Void>> updateClientFee(
            @PathVariable Long clientId,
            @RequestParam BigDecimal feeRate) {
        log.info("기업 고객 수수료 변경. ID: {}, 변경 수수료율: {}", clientId, feeRate);

        // TODO: clientService.updateClientFee(clientId, feeRate);

        return ResponseEntity.ok(ApiResponse.success("수수료율 변경이 완료되었습니다.", null));
    }
}