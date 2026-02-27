package me.projectexledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // 1. 임포트 추가

@EnableScheduling
@SpringBootApplication
public class ProjectExLedgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectExLedgerApplication.class, args);
    }

}