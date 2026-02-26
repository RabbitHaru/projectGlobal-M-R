package me.projectexledger.domain.exchange.repository;

import me.projectexledger.domain.exchange.entity.ExchangeRate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {

    Optional<ExchangeRate> findFirstByCurUnitOrderByUpdatedAtDesc(String curUnit);

    // 각 통화별 가장 최신 행 하나씩만 추출 (전광판용)
    @Query(value = "SELECT * FROM exchange_rates er1 " +
            "WHERE er1.id IN (SELECT MAX(er2.id) FROM exchange_rates er2 GROUP BY er2.cur_unit)",
            nativeQuery = true)
    List<ExchangeRate> findAllLatestRates();

    // 특정 통화의 최근 이력을 N개 가져오기 (그래프 및 증감 계산용)
    @Query("SELECT er FROM ExchangeRate er WHERE er.curUnit = :curUnit ORDER BY er.updatedAt DESC")
    List<ExchangeRate> findRecentByCurUnit(@Param("curUnit") String curUnit, Pageable pageable);

    // 중복 방지를 위해 특정 날짜(범위)에 데이터가 이미 있는지 확인
    boolean existsByUpdatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 특정 날짜에 특정 통화가 이미 있는지 확인
    boolean existsByCurUnitAndUpdatedAtBetween(String curUnit, LocalDateTime start, LocalDateTime end);
}