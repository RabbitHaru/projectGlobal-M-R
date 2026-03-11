package me.projectexledger.domain.audit.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.projectexledger.domain.BaseEntity;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SystemAuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String userEmail;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(nullable = false, length = 50)
    private String clientIp;

    @Column(nullable = false, length = 200)
    private String requestUri;

    @Column(nullable = false)
    private Long durationMs;

    @Column(nullable = true, length = 500)
    private String errorMessage;

    @Builder
    public SystemAuditLog(String userEmail, String action, String clientIp, String requestUri, Long durationMs,
            String errorMessage) {
        this.userEmail = userEmail;
        this.action = action;
        this.clientIp = clientIp;
        this.requestUri = requestUri;
        this.durationMs = durationMs;
        this.errorMessage = errorMessage;
    }
}
