package me.projectexledger.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * 전역으로 현재 인증된 사용자의 정보를 꺼내오기 위한 보안 유틸리티 클래스
 */
public class SecurityUtil {

    private SecurityUtil() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * SecurityContext에서 현재 로그인한 회원의 이메일(혹은 아이디)을 조회합니다.
     * 
     * @return 현재 인증된 사용자의 이메일. 인증되지 않았을 경우 "system" 반환
     */
    public static String getCurrentUserEmail() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return "system";
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }

        return "system";
    }
}
