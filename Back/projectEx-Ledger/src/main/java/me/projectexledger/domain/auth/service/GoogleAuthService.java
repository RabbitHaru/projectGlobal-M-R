package me.projectexledger.domain.auth.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

@Service
public class GoogleAuthService {

    private final GoogleAuthenticator gAuth;

    public GoogleAuthService() {
        this.gAuth = new GoogleAuthenticator();
    }

    /**
     * 무작위 Base32 시크릿 키 생성
     */
    public String generateSecretKey() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    /**
     * QR 코드 생성을 위한 otpauth:// URI 반환
     */
    public String generateOtpSetupUrl(String accountName, String secretKey) {
        return GoogleAuthenticatorQRGenerator.getOtpAuthURL(
                "Ex-Ledger",
                accountName,
                new GoogleAuthenticatorKey.Builder(secretKey).build());
    }

    /**
     * 사용자가 입력한 6자리 코드 검증
     */
    public boolean verifyOtp(String secretKey, int otpCode) {
        return gAuth.authorize(secretKey, otpCode);
    }
}
