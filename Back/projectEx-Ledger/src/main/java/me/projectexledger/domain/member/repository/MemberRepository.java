package me.projectexledger.domain.member.repository;

import me.projectexledger.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import me.projectexledger.domain.member.entity.AdminApprovalStatus;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);

    // 사업자 번호로 승인 대기 중인(isApproved=false) 유저 조회
    List<Member> findByBusinessNumberAndIsApprovedFalse(String businessNumber);

    // 역할과 관리자 승인 상태로 조회 (예: ROLE_COMPANY_ADMIN의 PENDING 상태)
    List<Member> findByRoleAndAdminApprovalStatus(Member.Role role, AdminApprovalStatus adminApprovalStatus);
}
