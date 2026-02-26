package me.projectexledger.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BusinessVerificationRequest {
    @NotBlank(message = "사업자등록번호는 필수입니다.")
    private String businessNumber;
}
