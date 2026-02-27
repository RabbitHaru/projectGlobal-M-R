package me.projectexledger.common.aop;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.common.annotation.AuditLog;
import me.projectexledger.security.SecurityUtil;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

/**
 * 금융 API 및 주요 메서드 호출 전역 자동 로깅 (블랙박스)
 */
@Slf4j
@Aspect
@Component
public class AuditLogAspect {

    @Around("@annotation(me.projectexledger.common.annotation.AuditLog)")
    public Object auditAndLog(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = null;
        try {
            request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        } catch (IllegalStateException e) {
            // Request scope 밖에서 호출된 경우 무시
        }

        String clientIp = request != null ? getClientIp(request) : "UNKNOWN_IP";
        String requestUri = request != null ? request.getRequestURI() : "UNKNOWN_URI";
        String userEmail = SecurityUtil.getCurrentUserEmail();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        AuditLog auditLogAnnotation = method.getAnnotation(AuditLog.class);
        String action = auditLogAnnotation != null && !auditLogAnnotation.action().isEmpty()
                ? auditLogAnnotation.action()
                : signature.getName();

        log.info("[AUDIT-START] User: [{}], Action: [{}], IP: [{}], URI: [{}]", userEmail, action, clientIp,
                requestUri);

        Object result;
        long startTime = System.currentTimeMillis();
        try {
            result = joinPoint.proceed();
        } catch (Throwable th) {
            log.error("[AUDIT-ERROR] User: [{}], Action: [{}], IP: [{}], Error: {}", userEmail, action, clientIp,
                    th.getMessage());
            throw th;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            log.info("[AUDIT-END] User: [{}], Action: [{}], Duration: {}ms", userEmail, action, duration);
        }

        return result;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
