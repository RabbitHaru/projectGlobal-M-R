package me.projectexledger.common.aop;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.member.entity.Member;
import me.projectexledger.domain.member.repository.MemberRepository;
import me.projectexledger.security.SecurityUtil;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class MfaAspect {

    private final MemberRepository memberRepository;
    private final GoogleAuthenticator googleAuthenticator;

    // @RequireMfa 어노테이션이 붙은 컨트롤러/메서드 실행 직전에 가로챔
    @Before("@annotation(me.projectexledger.common.annotation.RequireMfa)")
    public void verifyMfa() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new IllegalStateException("요청 컨텍스트를 찾을 수 없습니다.");
        }

        HttpServletRequest request = attributes.getRequest();
        String otpCodeStr = request.getHeader("X-MFA-Code");

        if (otpCodeStr == null || otpCodeStr.trim().isEmpty()) {
            throw new IllegalArgumentException("MFA_REQUIRED: 해당 금융 기능을 실행하려면 승인된 구글 OTP 번호(X-MFA-Code)가 필요합니다.");
        }

        String email = SecurityUtil.getCurrentUserEmail();
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!member.isMfaEnabled()) {
            throw new IllegalArgumentException("MFA_SETUP_REQUIRED: 구글 OTP가 설정되지 않았습니다. 내 정보 페이지에서 먼저 OTP를 설정해주세요.");
        }

        int otpCode;
        try {
            otpCode = Integer.parseInt(otpCodeStr.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("잘못된 OTP 코드 형식입니다. 숫자만 입력해주세요.");
        }

        boolean isCodeValid = googleAuthenticator.authorize(member.getTotpSecret(), otpCode);
        if (!isCodeValid) {
            throw new IllegalArgumentException("잘못된 OTP 인증번호입니다. 확인 후 다시 시도해주세요.");
        }

        log.info("JIT MFA Verified successfully for User: {}", email);
    }
}
