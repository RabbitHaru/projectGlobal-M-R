package me.projectexledger.domain.client.service;

import lombok.RequiredArgsConstructor;
import me.projectexledger.domain.client.dto.repository.ClientRepository;
import me.projectexledger.domain.client.entity.Client;
import me.projectexledger.domain.client.entity.ClientStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * [Member A 담당] 수백 건 규모의 기업 고객 및 수수료 관리 서비스
 * 예비군 가기 전(3/8)까지 완공해야 할 핵심 비즈니스 로직입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;

    /**
     * 가입 신청 중인 기업 목록을 가져옵니다 (수백 건 이내 최적화).
     */
    @Transactional(readOnly = true)
    public List<Client> getPendingClients() {
        return clientRepository.findByStatus(ClientStatus.PENDING);
    }

    /**
     * 기업 가입 승인 및 수수료 설정
     * 송금 로직이 돌아가기 위한 필수 선행 작업입니다.
     */
    public void approveClient(Long clientId, BigDecimal feeRate) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("해당 기업을 찾을 수 없습니다."));

        client.approve(); // 상태를 APPROVED로 변경
        client.updateFeeRate(feeRate); // 소통된 수수료율 적용

        // save는 JPA 변경 감지(Dirty Checking)에 의해 자동으로 처리됩니다.
    }
}