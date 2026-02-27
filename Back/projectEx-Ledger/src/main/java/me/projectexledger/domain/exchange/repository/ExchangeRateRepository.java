package me.projectexledger.domain.exchange.repository;

import me.projectexledger.domain.exchange.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {

    Optional<ExchangeRate> findFirstByCurUnitOrderByUpdatedAtDesc(String curUnit);

     // [핵심] 모든 통화의 가장 최근 환율 정보만 리스트로 가져옵니다.
     // Native Query를 사용하여 각 cur_unit 그룹 내에서 최신 ID를 찾아 조회합니다.

    @Query(value = "SELECT * FROM exchange_rates er1 " +
            "WHERE er1.id IN (SELECT MAX(er2.id) FROM exchange_rates er2 GROUP BY er2.cur_unit)",
            nativeQuery = true)
    List<ExchangeRate> findAllLatestRates();
}