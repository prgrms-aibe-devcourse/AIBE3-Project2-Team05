package com.back.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 임시 클래스 - 매칭 시스템 개발/테스트용
 * TODO: [Global 담당자] - 정식 JpaConfig로 교체 필요
 *
 * JPA 설정 (Auditing 활성화)
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
