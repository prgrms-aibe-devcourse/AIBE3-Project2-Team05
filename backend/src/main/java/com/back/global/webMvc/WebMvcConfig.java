package com.back.global.webMvc;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Value("${file.upload.dir}")
    private String uploadDir;
    @Value("${file.access.base-url}")
    private String baseUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
                .addMapping("/api/v1/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. URL 패턴 정의 (예: /images/**)
        String resourcePath = baseUrl + "**";

        // 2. 파일 시스템 경로 정의 (file:///{로컬 경로})
        String absolutePath = "file:///" + uploadDir;

        // ⭐매핑: 클라이언트가 /images/{파일명}으로 요청하면,
        // Spring이 {로컬 경로}/{파일명}을 찾아서 제공합니다.
        registry.addResourceHandler(resourcePath)
                .addResourceLocations(absolutePath)
                // 로컬 환경 외에서는 캐싱 비활성화 권장
                .setCachePeriod(0);
    }
}