package me.projectexledger.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 이 메서드를 호출하려면 Header (또는 Request Body)에 유효한 MFA(OTP) 코드가 포함되어 있어야 함을 명시합니다.
 * AOP (MfaAspect)에 의해 런타임에 처리됩니다.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireMfa {
    // 필요한 경우 추가 속성 정의 가능 (예: String message() default "MFA 코드가 필요합니다";)
}
