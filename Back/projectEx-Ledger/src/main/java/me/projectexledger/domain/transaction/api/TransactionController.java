package me.projectexledger.domain.transaction.api;

import lombok.RequiredArgsConstructor;
import me.projectexledger.common.dto.ApiResponse;
import me.projectexledger.domain.transaction.dto.MyDashboardResponse;
import me.projectexledger.domain.transaction.dto.TransactionRequest;
import me.projectexledger.domain.transaction.entity.Transaction;
import me.projectexledger.domain.transaction.service.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ApiResponse<Long> createTransaction(
            @RequestBody TransactionRequest request,
            Principal principal) {

        String email = (principal != null) ? principal.getName() : "test@test.com";

        Transaction transaction = transactionService.createTransaction(
                email,
                request.getAmount(),
                request.getCurrency(),
                request.getDescription(),
                request.getExternalTransactionId()
        );

        return ApiResponse.success("거래가 생성되었습니다.", transaction.getId());
    }

    @GetMapping("/my-dashboard")
    public ApiResponse<MyDashboardResponse> getMyDashboard(Principal principal) {
        // B님의 보안 설정이 정상일 땐 principal.getName()을,
        // 테스트 중일 땐 하드코딩된 이메일을 사용하세요.
        String email = (principal != null) ? principal.getName() : "test@test.com";

        MyDashboardResponse dashboard = transactionService.getMyDashboardSummary(email);
        return ApiResponse.success("대시보드 조회 성공", dashboard);
    }
}