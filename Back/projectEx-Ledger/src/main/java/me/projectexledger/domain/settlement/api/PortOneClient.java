package me.projectexledger.domain.settlement.api;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
public class PortOneClient {

    private final WebClient webClient;

    public PortOneClient(WebClient.Builder webClientBuilder,
                         @Value("${portone.api.secret}") String apiSecret) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.portone.io")
                .defaultHeader("Authorization", "PortOne " + apiSecret)
                .build();
    }

    /**
     * [Member A 테스트 모드]
     * Member C의 결제가 없어도 '가상계좌 입금 완료' 데이터를 흉내냅니다.
     */
    public List<PortOneTxDto> fetchCompletedPayments(String targetDate) {
        log.info("📡 포트원 V2 API 호출 (시뮬레이션 모드): {} 일자 내역 조회", targetDate);

        // 실제 연동 시 아래 주석을 해제하면 됩니다.
        /*
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/payments")
                        .queryParam("status", "PAID")
                        .build())
                .retrieve()
                .bodyToMono(PortOneResponse.class)
                .map(PortOneResponse::items)
                .block();
        */

        // [실제 같은 테스트 데이터 생성]
        // 시나리오: 유저가 1,000,500원을 가상계좌로 입금 성공함
        return List.of(
                new PortOneTxDto(
                        "TX_VIRTUAL_001",           // 거래 ID
                        new Amount(new BigDecimal("1000500")), // 입금 금액
                        "KRW",                      // 통화
                        "VIRTUAL_ACCOUNT",          // 결제 수단 (가상계좌)
                        "PAID"                      // 결제 상태
                ),
                new PortOneTxDto(
                        "TX_VIRTUAL_002",
                        new Amount(new BigDecimal("500000")),
                        "KRW",
                        "VIRTUAL_ACCOUNT",
                        "PAID"
                )
        );
    }

    // 포트원 규격에 맞춘 DTO 구조
    public record PortOneTxDto(String id, Amount amount, String currency, String method, String status) {}
    public record Amount(BigDecimal total) {}
}