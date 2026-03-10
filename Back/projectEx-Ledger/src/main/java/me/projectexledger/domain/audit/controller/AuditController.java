package me.projectexledger.domain.audit.controller;

import lombok.RequiredArgsConstructor;
import me.projectexledger.common.dto.ApiResponse;
import me.projectexledger.domain.audit.dto.AuditLogResponse;
import me.projectexledger.domain.audit.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/logs")
    @PreAuthorize("hasRole('INTEGRATED_ADMIN')")
    public ApiResponse<Page<AuditLogResponse>> getAuditLogs(Pageable pageable) {
        Page<AuditLogResponse> logs = auditService.getAuditLogs(pageable);
        return ApiResponse.success("감사 로그 조회 완료", logs);
    }
}
