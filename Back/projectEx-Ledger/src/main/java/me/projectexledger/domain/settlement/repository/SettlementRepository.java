package me.projectexledger.domain.settlement.repository;

import me.projectexledger.domain.settlement.entity.Settlement;
import me.projectexledger.domain.settlement.entity.SettlementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// JpaRepository를 상속받으면 기본적인 CRUD(생성, 조회, 수정, 삭제)가 자동으로 완성됩니다.
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    // 💡 핵심: 이 한 줄이 없어서 findByStatus에 빨간 줄이 떴던 것입니다!
    // 스프링 데이터 JPA가 이 메서드 이름을 분석해서 자동으로 "SELECT * FROM settlements WHERE status = ?" 쿼리를 짜줍니다.
    List<Settlement> findByStatus(SettlementStatus status);
}