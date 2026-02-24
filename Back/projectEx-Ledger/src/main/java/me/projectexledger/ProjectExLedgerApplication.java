package me.projectexledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ProjectExLedgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectExLedgerApplication.class, args);
    }

}
