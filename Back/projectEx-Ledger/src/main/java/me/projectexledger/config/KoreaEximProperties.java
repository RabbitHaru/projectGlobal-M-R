package me.projectexledger.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "koreaexim.api")
public class KoreaEximProperties {
    private String baseUrl;
    private String serviceKey;
    private String dataType;
}