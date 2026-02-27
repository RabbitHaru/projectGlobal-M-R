package me.projectexledger.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BusinessVerificationResponse {
    private boolean valid;
    private String message;
}
