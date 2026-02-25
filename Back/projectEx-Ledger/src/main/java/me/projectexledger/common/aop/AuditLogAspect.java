package me.projectexledger.common.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

/**
 * Automatic logging for financial API calls
 */
@Slf4j
@Aspect
@Component
public class AuditLogAspect {

    @Before("execution(* me.projectexledger..*Controller.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        log.info("[Audit Log] API call execution: {}", joinPoint.getSignature().getName());
    }
}
