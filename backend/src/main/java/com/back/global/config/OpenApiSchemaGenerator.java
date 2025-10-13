package com.back.global.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class OpenApiSchemaGenerator implements ApplicationListener<ApplicationReadyEvent> {

    private final Environment environment;

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${openapi.schema.enabled:true}")
    private boolean enabled;

    public OpenApiSchemaGenerator(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        if (!enabled || !isDev()) return;

        CompletableFuture.runAsync(() -> {
            try {
                TimeUnit.SECONDS.sleep(3);
                generateSchema();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }

    private boolean isDev() {
        String[] profiles = environment.getActiveProfiles();
        for (String profile : profiles) {
            if ("dev".equals(profile) || "local".equals(profile)) return true;
        }
        return false;
    }

    private void generateSchema() {
        try {
            String command = String.format(
                "npx --package typescript --package openapi-typescript openapi-typescript http://localhost:%s/v3/api-docs -o ../frontend/src/lib/backend/schema.d.ts",
                serverPort
            );

            ProcessBuilder pb = new ProcessBuilder();
            if (System.getProperty("os.name").toLowerCase().contains("windows")) {
                pb.command("cmd", "/c", command);
            } else {
                pb.command("sh", "-c", command);
            }

            Process process = pb.start();
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);

            if (finished && process.exitValue() == 0) {
                log.info("✅ OpenAPI 스키마 생성 완료");
            } else {
                log.error("❌ OpenAPI 스키마 생성 실패");
            }
        } catch (Exception e) {
            log.error("OpenAPI 스키마 생성 오류", e);
        }
    }
}
