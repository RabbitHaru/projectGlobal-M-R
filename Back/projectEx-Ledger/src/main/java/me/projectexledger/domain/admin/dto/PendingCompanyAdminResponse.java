package me.projectexledger.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import me.projectexledger.domain.member.entity.Member;

@Getter
@Builder
@AllArgsConstructor
public class PendingCompanyAdminResponse {
    private Long userId;
    private String email;
    private String name;
    private String businessNumber;
    private String licenseFileUuid;
    private String createdAt;

    public static PendingCompanyAdminResponse from(Member member) {
        return PendingCompanyAdminResponse.builder()
                .userId(member.getId())
                .email(member.getEmail())
                .name(member.getName())
                .businessNumber(member.getBusinessNumber())
                .licenseFileUuid(member.getLicenseFileUuid())
                .createdAt(member.getCreatedAt() != null ? member.getCreatedAt().toString() : null)
                .build();
    }
}
