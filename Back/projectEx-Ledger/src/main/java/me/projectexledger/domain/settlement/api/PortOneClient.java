package me.projectexledger.domain.settlement.api;

import me.projectexledger.infrastructure.external.portone.dto.PortOnePaymentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// 💡 팁: 이제 UriComponentsBuilder는 아예 import 할 필요도 없습니다!

@Component
public class PortOneClient {

    private final RestClient restClient;
    private final String apiUrl;

    // 1. 빨간줄 해결: Builder 주입 대신 RestClient.create()로 직접 생성합니다.
    public PortOneClient(@Value("${external.portone.api-url}") String apiUrl) {
        this.restClient = RestClient.create();
        this.apiUrl = apiUrl;
    }

    public PortOnePaymentResponse getPayments(String authToken, String from, String to, int page, int size) {

        // 2. 빨간줄 해결: fromHttpUrl 대신 RestClient가 자체 지원하는 내장 uri 빌더를 씁니다.
        return restClient.get()
                .uri(apiUrl + "/payments", uriBuilder -> uriBuilder
                        .queryParam("from", from)
                        .queryParam("to", to)
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build())
                .header("Authorization", authToken) // "Bearer {secret_key}"
                .retrieve()
                .body(PortOnePaymentResponse.class);
    }
}