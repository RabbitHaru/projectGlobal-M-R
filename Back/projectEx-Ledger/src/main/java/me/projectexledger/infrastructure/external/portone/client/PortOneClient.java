package me.projectexledger.infrastructure.external.portone.client;

import me.projectexledger.infrastructure.external.portone.dto.PortOnePaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 포트원 API 연동을 위한 OpenFeign 클라이언트
 */
@FeignClient(name = "portone-client", url = "${external.portone.api-url}")
public interface PortOneClient {

    /**
     * 특정 날짜의 결제 내역 리스트 조회
     * @param authToken 'Bearer {secret_key}' 형식의 인증 토큰
     * @param from 결제 조회 시작 시점 (ISO 8601)
     * @param to 결제 조회 종료 시점 (ISO 8601)
     */
    @GetMapping("/payments")
    PortOnePaymentResponse getPayments(
            @RequestHeader("Authorization") String authToken,
            @RequestParam("from") String from,
            @RequestParam("to") String to,
            @RequestParam("page") int page,
            @RequestParam("size") int size
    );
}