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

    // application.yml에 있는 포트원 시크릿 키를 안전하게 주입받습니다.
    public PortOneClient(WebClient.Builder webClientBuilder,
                         @Value("${portone.api.secret}") String apiSecret) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.portone.io")
                .defaultHeader("Authorization", "PortOne " + apiSecret)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * 특정 날짜의 결제 완료(PAID) 내역을 포트원 서버에서 긁어옵니다.
     */
    public List<PortOneTxDto> fetchCompletedPayments(String targetDate) {
        log.info("📡 포트원 V2 API 호출: {} 일자 정산 내역 조회", targetDate);

        try {
            // 실제 API 호출 로직 (포트원 V2 결제 내역 단건/다건 조회 API 규격에 맞춤)
            /*
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/payments")
                            .queryParam("status", "PAID")
                            .queryParam("created_at", targetDate)
                            .build())
                    .retrieve()
                    .bodyToFlux(PortOneTxDto.class)
                    .collectList()
                    .block(); // Batch에서 동기적으로 기다려야 하므로 block 처리
            */

            // 개발 및 테스트를 위한 더미 데이터 반환 (실제 연동 전까지 사용)
            return List.of(
                    new PortOneTxDto("TX_20260225_001", new BigDecimal("50000.00"), "KRW"),
                    new PortOneTxDto("TX_20260225_002", new BigDecimal("150000.00"), "KRW")
            );
        } catch (Exception e) {
            log.error("🚨 포트원 API 연동 실패: {}", e.getMessage());
            throw new RuntimeException("외부 결제망 통신 오류", e);
        }
    }

    // 포트원 응답 데이터를 담을 간결한 Record (Java 16+)
    public record PortOneTxDto(String transactionId, BigDecimal amount, String currency) {}
}