package me.projectexledger.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 전역 감사 로깅 대상 메서드에 부착할 어노테이션
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLog {
    /**
     * 수행되는 행위의 상세한 이름 (e.g. "정산 실행", "비밀번호 초기화")
     */
    String action() default "";
}
