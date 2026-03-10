package me.projectexledger.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import redis.embedded.RedisServer;
import org.springframework.util.StringUtils;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

@Slf4j
@Profile("local")
@Configuration
public class EmbeddedRedisConfig {

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    private RedisServer redisServer;

    @PostConstruct
    public void redisServer() throws Exception {
        int port = isRedisRunning() ? findAvailablePort() : redisPort;

        if (isArmMac()) {
            // For developers on Apple Silicon if needed
            redisServer = new RedisServer(port);
        } else {
            redisServer = RedisServer.builder()
                    .port(port)
                    .setting("maxmemory 128M") // Set limits
                    .build();
        }

        try {
            redisServer.start();
            log.info("✅ Embedded Redis Server started on port {}", port);
        } catch (Exception e) {
            log.error("❌ Failed to start Embedded Redis: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void stopRedis() {
        if (redisServer != null) {
            redisServer.stop();
            log.info("⛔ Embedded Redis Server stopped.");
        }
    }

    private boolean isRedisRunning() throws IOException {
        return isRunning(executeGrepProcessCommand(redisPort));
    }

    public int findAvailablePort() throws IOException {
        for (int port = 10000; port <= 65535; port++) {
            Process process = executeGrepProcessCommand(port);
            if (!isRunning(process)) {
                return port;
            }
        }
        throw new IllegalArgumentException("Not Found Available port: 10000 ~ 65535");
    }

    private Process executeGrepProcessCommand(int port) throws IOException {
        String command = String.format("netstat -nat | grep LISTEN|grep %d", port);
        String[] shell = { "/bin/sh", "-c", command };
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            command = String.format("netstat -nao | find \"LISTEN\" | find \"%d\"", port);
            shell = new String[] { "cmd.exe", "/y", "/c", command };
        }
        return Runtime.getRuntime().exec(shell);
    }

    private boolean isRunning(Process process) {
        String line;
        StringBuilder pidInfo = new StringBuilder();

        try (BufferedReader input = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            while ((line = input.readLine()) != null) {
                pidInfo.append(line);
            }
        } catch (Exception e) {
        }
        return StringUtils.hasText(pidInfo.toString());
    }

    private boolean isArmMac() {
        return System.getProperty("os.arch").equals("aarch64") &&
                System.getProperty("os.name").equals("Mac OS X");
    }
}
