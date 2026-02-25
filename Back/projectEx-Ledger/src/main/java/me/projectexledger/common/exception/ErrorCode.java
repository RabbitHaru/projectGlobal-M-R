package me.projectexledger.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 전역 에러 코드 정의
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 400 잘못된 요청
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "잘못된 입력 값입니다"),

    // 401 권한 없음 (인증 실패)
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다"),

    // 403 접근 금지 (인가 실패)
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근이 거부되었습니다"),

    // 404 리소스를 찾을 수 없음
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "리소스를 찾을 수 없습니다"),

    // 500 내부 서버 오류
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다");

    private final HttpStatus httpStatus;
    private final String message;
}
