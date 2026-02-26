package me.projectexledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients; // 추가

@EnableFeignClients // 프로젝트 내 FeignClient 스캔 활성화
@SpringBootApplication
public class ExLedgerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExLedgerApplication.class, args);
    }
}