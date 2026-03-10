package me.projectexledger.domain.audit.repository;

import me.projectexledger.domain.audit.entity.SystemAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemAuditLogRepository extends JpaRepository<SystemAuditLog, Long> {
    Page<SystemAuditLog> findAllByOrderByIdDesc(Pageable pageable);
}
