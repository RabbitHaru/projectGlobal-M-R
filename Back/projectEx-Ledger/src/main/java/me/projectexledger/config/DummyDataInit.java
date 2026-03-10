package me.projectexledger.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.projectexledger.domain.audit.entity.SystemAuditLog;
import me.projectexledger.domain.audit.repository.SystemAuditLogRepository;
import me.projectexledger.domain.client.entity.Client;
import me.projectexledger.domain.client.entity.ClientGrade;
import me.projectexledger.domain.client.entity.ClientStatus;
import me.projectexledger.domain.client.dto.repository.ClientRepository;
import me.projectexledger.domain.member.entity.AdminApprovalStatus;
import me.projectexledger.domain.member.entity.Member;
import me.projectexledger.domain.member.repository.MemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@Profile("!test") // 테스트 환경에서는 실행되지 않도록 설정
@RequiredArgsConstructor
public class DummyDataInit implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final ClientRepository clientRepository;
    private final SystemAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("[DummyDataInit] 더미 데이터 초기화를 시작합니다...");

        initClients();
        initMembers();
        initAuditLogs();

        log.info("[DummyDataInit] 더미 데이터 초기화 완료!");
    }

    private void initClients() {
        if (clientRepository.count() > 0) {
            log.info("Client 데이터가 이미 존재합니다. 스킵.");
            return;
        }

        Client client1 = Client.builder()
                .name("(주)테스트기업A")
                .businessNumber("123-45-67890")
                .status(ClientStatus.PENDING)
                .feeRate(new BigDecimal("0.0200"))
                .bankName("국민은행")
                .accountNumber("123456-01-123456")
                .preferenceRate(new BigDecimal("0.8000"))
                .merchantId("MCT-TEST-001")
                .grade(ClientGrade.GENERAL)
                .build();

        Client client2 = Client.builder()
                .name("(주)엑스레저글로벌")
                .businessNumber("987-65-43210")
                .status(ClientStatus.APPROVED)
                .feeRate(new BigDecimal("0.0100"))
                .bankName("신한은행")
                .accountNumber("110-123-456789")
                .preferenceRate(new BigDecimal("0.9000"))
                .merchantId("MCT-TEST-002")
                .networkFee(new BigDecimal("1500"))
                .exchangeSpread(new BigDecimal("8.00"))
                .grade(ClientGrade.VIP)
                .build();

        Client client3 = Client.builder()
                .name("(주)글로벌무역")
                .businessNumber("111-22-33333")
                .status(ClientStatus.PENDING)
                .feeRate(new BigDecimal("0.0150"))
                .bankName("하나은행")
                .accountNumber("123-123456-12345")
                .preferenceRate(new BigDecimal("0.8500"))
                .merchantId("MCT-TEST-003")
                .grade(ClientGrade.GENERAL)
                .build();

        clientRepository.saveAll(List.of(client1, client2, client3));
        log.info("더미 Client(가맹점) 생성 완료");
    }

    private void initMembers() {
        if (memberRepository.findByEmail("admin@exledger.com").isPresent()) {
            log.info("Member 데이터가 이미 존재합니다. 스킵.");
            return;
        }

        // 1. 최고 관리자 (사이트 관리자)
        Member admin = Member.builder()
                .email("admin@exledger.com")
                .password(passwordEncoder.encode("admin123!"))
                .name("최고관리자")
                .role(Member.Role.ROLE_INTEGRATED_ADMIN)
                .build();
        // 최고관리자는 생성자에서 기본으로 승인됨

        // 2. 기업 관리자 대기 상태 (기업심사 테스트용)
        Member pendingCompanyAdmin = Member.builder()
                .email("ceo@testcompany.com")
                .password(passwordEncoder.encode("test1234!"))
                .name("김대표")
                .role(Member.Role.ROLE_COMPANY_ADMIN)
                .businessNumber("123-45-67890")
                .build();
        // 생성자에서 자동 대기 상태

        Member pendingCompanyAdmin2 = Member.builder()
                .email("manager@globaltrade.com")
                .password(passwordEncoder.encode("test1234!"))
                .name("박매니저")
                .role(Member.Role.ROLE_COMPANY_ADMIN)
                .businessNumber("111-22-33333")
                .build();

        // 3. 일반 유저
        Member user = Member.builder()
                .email("user@example.com")
                .password(passwordEncoder.encode("user1234!"))
                .name("일반유저")
                .role(Member.Role.ROLE_USER)
                .build();

        memberRepository.saveAll(List.of(admin, pendingCompanyAdmin, pendingCompanyAdmin2, user));
        log.info("더미 Member(사용자) 생성 완료");
    }

    private void initAuditLogs() {
        if (auditLogRepository.count() > 0) {
            log.info("AuditLog 데이터가 이미 존재합니다. 스킵.");
            return;
        }

        SystemAuditLog log1 = SystemAuditLog.builder()
                .userEmail("admin@exledger.com")
                .action("GET /api/admin/dashboard/summary")
                .clientIp("127.0.0.1")
                .requestUri("/api/admin/dashboard/summary")
                .durationMs(45L)
                .build();

        SystemAuditLog log2 = SystemAuditLog.builder()
                .userEmail("user@example.com")
                .action("POST /api/auth/login")
                .clientIp("192.168.0.15")
                .requestUri("/api/auth/login")
                .durationMs(120L)
                .build();

        SystemAuditLog log3 = SystemAuditLog.builder()
                .userEmail("ceo@testcompany.com")
                .action("POST /api/auth/signup")
                .clientIp("10.0.0.5")
                .requestUri("/api/auth/signup")
                .durationMs(350L)
                .build();

        SystemAuditLog log4 = SystemAuditLog.builder()
                .userEmail("admin@exledger.com")
                .action("GET /api/admin/companies/pending")
                .clientIp("127.0.0.1")
                .requestUri("/api/admin/companies/pending")
                .durationMs(22L)
                .build();

        auditLogRepository.saveAll(List.of(log1, log2, log3, log4));
        log.info("더미 AuditLog(감사로그) 생성 완료");
    }
}
