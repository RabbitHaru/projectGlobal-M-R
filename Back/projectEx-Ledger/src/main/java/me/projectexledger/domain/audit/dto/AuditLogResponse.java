package me.projectexledger.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import me.projectexledger.domain.audit.entity.SystemAuditLog;

@Getter
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String userEmail;
    private String action;
    private String clientIp;
    private String requestUri;
    private Long durationMs;
    private String errorMessage;
    private String createdAt;

    public static AuditLogResponse from(SystemAuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getUserEmail(),
                log.getAction(),
                log.getClientIp(),
                log.getRequestUri(),
                log.getDurationMs(),
                log.getErrorMessage(),
                log.getCreatedAt() != null ? log.getCreatedAt().toString() : null);
    }
}
