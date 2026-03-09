package me.projectexledger.domain.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.projectexledger.common.dto.ApiResponse;
import me.projectexledger.domain.auth.dto.LoginRequest;
import me.projectexledger.domain.auth.dto.SignupRequest;
import me.projectexledger.domain.auth.dto.TokenResponse;
import me.projectexledger.domain.auth.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import me.projectexledger.domain.auth.dto.BusinessVerificationRequest;
import me.projectexledger.domain.auth.dto.BusinessVerificationResponse;
import me.projectexledger.domain.auth.dto.MfaLoginRequest;
import me.projectexledger.domain.auth.dto.MfaSetupResponse;
import me.projectexledger.domain.auth.dto.MfaVerifyRequest;
import me.projectexledger.domain.auth.service.BusinessVerificationService;
import me.projectexledger.common.annotation.RequireMfa;
import org.springframework.web.bind.annotation.GetMapping;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final BusinessVerificationService businessVerificationService;

    @PostMapping("/signup")
    public ApiResponse<Long> signup(@Valid @RequestBody SignupRequest request) {
        Long memberId = authService.signup(request);
        return ApiResponse.success("회원가입이 완료되었습니다.", memberId);
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokenResponse = authService.login(request);
        return ApiResponse.success("로그인 성공", tokenResponse);
    }

    @PostMapping("/login/mfa")
    public ApiResponse<TokenResponse> loginWithMfa(@Valid @RequestBody MfaLoginRequest request) {
        TokenResponse tokenResponse = authService.loginWithMfa(request);
        return ApiResponse.success("MFA 로그인 성공", tokenResponse);
    }

    @PostMapping("/mfa/setup")
    public ApiResponse<MfaSetupResponse> setupMfa(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            return ApiResponse.fail("이메일이 필요합니다.");
        }
        MfaSetupResponse response = authService.setupMfa(email);
        return ApiResponse.success("MFA 설정 준비 완료", response);
    }

    @PostMapping("/mfa/enable")
    public ApiResponse<Void> enableMfa(@Valid @RequestBody MfaVerifyRequest request) {
        String email = request.getEmail();
        if (email == null || email.isEmpty()) {
            return ApiResponse.fail("이메일이 필요합니다.");
        }
        authService.enableMfa(email, request);
        return ApiResponse.success("MFA가 성공적으로 활성화되었습니다.", null);
    }

    @PostMapping("/verify-business")
    public ApiResponse<BusinessVerificationResponse> verifyBusiness(
            @Valid @RequestBody BusinessVerificationRequest request) {
        BusinessVerificationResponse response = businessVerificationService.verify(request.getBusinessNumber());
        if (response.isValid()) {
            return ApiResponse.success("검증 완료", response);
        } else {
            return ApiResponse.fail("검증 실패: " + response.getMessage());
        }
    }

    @RequireMfa
    @GetMapping("/test-mfa")
    public ApiResponse<String> testMfaEndpoint(Principal principal) {
        return ApiResponse.success("MFA 인증을 무사히 통과했습니다! 사용자: " + principal.getName(), null);
    }
}
