package me.projectexledger.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MfaSetupResponse {
    private String secretKey;
    private String qrCodeUrl;
}
