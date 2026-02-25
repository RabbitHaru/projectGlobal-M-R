package me.projectexledger.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

// Spring Batch 5.x 기준으로 작성될 설정 파일입니다.
@Slf4j
@Configuration
@RequiredArgsConstructor
public class BatchConfig {

    // Member A님은 여기서 Job, Step, ItemReader, ItemProcessor, ItemWriter를 정의하여
    // 매일 밤 12시에 DB에서 어제자 PENDING 상태인 Settlement 데이터를 1000건씩 읽어와
    // ReconciliationUtil을 돌리고 상태를 업데이트하는 로직을 조립하게 됩니다.

    /* 예시 뼈대
    @Bean
    public Job dailySettlementJob(JobRepository jobRepository, Step reconciliationStep) {
        return new JobBuilder("dailySettlementJob", jobRepository)
                .start(reconciliationStep)
                .build();
    }
    */
}