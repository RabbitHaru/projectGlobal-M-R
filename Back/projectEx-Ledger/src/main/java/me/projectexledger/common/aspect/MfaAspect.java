package me.projectexledger.common.aspect;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.member.entity.Member;
import me.projectexledger.domain.member.repository.MemberRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class MfaAspect {

    private final GoogleAuthenticator googleAuthenticator;
    private final MemberRepository memberRepository;

    @Before("@annotation(me.projectexledger.common.annotation.RequireMfa)")
    public void verifyMfaBeforeExecution(JoinPoint joinPoint) {
        log.info("MfaAspect 拦截(Intercepted): {}", joinPoint.getSignature().getName());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalArgumentException("로그인이 필요한 작업입니다.");
        }

        String email = authentication.getName();
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!member.isMfaEnabled() || member.getTotpSecret() == null) {
            throw new IllegalArgumentException("이 작업을 수행하려면 먼저 Google OTP 보안 설정을 활성화해야 합니다.");
        }

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                .getRequest();
        String otpHeader = request.getHeader("X-OTP-Code");

        if (otpHeader == null || otpHeader.trim().isEmpty()) {
            throw new IllegalArgumentException("요청 헤더에 'X-OTP-Code'가 누락되었습니다.");
        }

        int otpCode;
        try {
            otpCode = Integer.parseInt(otpHeader);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("OTP 코드는 숫자여야 합니다.");
        }

        boolean isCodeValid = googleAuthenticator.authorize(member.getTotpSecret(), otpCode);
        if (!isCodeValid) {
            log.warn("MFA 검증 실패 - 사용자: {}, 입력값: {}", email, otpCode);
            throw new IllegalArgumentException("잘못된 OTP 코드입니다.");
        }

        log.info("MFA 검증 성공 - 사용자: {}", email);
    }
}
