package me.projectexledger.domain.client.dto.repository;

import me.projectexledger.domain.client.entity.Client;
import me.projectexledger.domain.client.entity.ClientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * 기업 고객 데이터 접근 계층
 * 관리자 페이지의 기업 승인 및 수수료 관리 기능을 지원
 */
public interface ClientRepository extends JpaRepository<Client, Long> {

    /**
     * 특정 상태(PENDING, APPROVED 등)의 기업 목록을 조회
     * ClientManagement.tsx에서 가입 승인 대기 목록을 불러올 때 사용
     */
    List<Client> findByStatus(ClientStatus status);
}