package me.projectexledger.domain.exchange.repository;

import me.projectexledger.domain.exchange.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    // 특정 통화의 가장 최신 환율 정보를 가져오는 쿼리
    Optional<ExchangeRate> findFirstByCurUnitOrderByUpdatedAtDesc(String curUnit);
}