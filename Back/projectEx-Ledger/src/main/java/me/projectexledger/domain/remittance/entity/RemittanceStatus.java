package me.projectexledger.domain.remittance.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RemittanceStatus {
    REQUESTED("송금 신청 완료"),
    PENDING("은행 처리 대기중"),
    COMPLETED("해외 송금 완료"),
    FAILED("송금 실패"),
    REJECTED("관리자 반려");

    private final String description;
}