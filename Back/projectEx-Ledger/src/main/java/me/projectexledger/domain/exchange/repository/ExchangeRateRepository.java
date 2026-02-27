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

    List<ExchangeRate> findByCurUnitAndUpdatedAtAfterOrderByUpdatedAtAsc(
            String curUnit,
            LocalDateTime updatedAt
    );

    // 1. 특정 통화의 가장 최신 고시 정보 조회
    Optional<ExchangeRate> findFirstByCurUnitOrderByUpdatedAtDesc(String curUnit);

    // 2. 특정 통화의 기간별 환율 조회 (그래프용)
    // 필드명 일치: currencyCode -> curUnit, rateDate -> updatedAt
    List<ExchangeRate> findByCurUnitAndUpdatedAtBetweenOrderByUpdatedAtAsc(
            String curUnit, LocalDateTime start, LocalDateTime end);

    // 3. 전광판용: 각 통화별 가장 최신 행 추출 (Native Query)
    // DB 성능을 위해 인덱스를 타는 서브쿼리 전략 사용
    @Query(value = "SELECT * FROM exchange_rates er1 " +
            "WHERE er1.id IN (SELECT MAX(er2.id) FROM exchange_rates er2 GROUP BY er2.cur_unit)",
            nativeQuery = true)
    List<ExchangeRate> findAllLatestRates();

    // 4. 특정 통화의 최근 이력을 N개 가져오기 (Pageable 활용으로 메모리 효율화)
    @Query("SELECT er FROM ExchangeRate er WHERE er.curUnit = :curUnit ORDER BY er.updatedAt DESC")
    List<ExchangeRate> findRecentByCurUnit(@Param("curUnit") String curUnit, Pageable pageable);

    // 5. 중복 방지: 특정 시간 범위 내 데이터 존재 여부 확인
    boolean existsByCurUnitAndUpdatedAtBetween(String curUnit, LocalDateTime start, LocalDateTime end);
}