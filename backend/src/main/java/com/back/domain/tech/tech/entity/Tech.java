package com.back.domain.tech.tech.entity;

import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 임시 엔티티 - 매칭 시스템 개발/테스트용
 * TODO: [Tech 담당자] - 정식 엔티티로 교체 필요
 * 브랜치: feature/matching-temp (main merge 대기)
 * 생성: 2025-10-12 임창기 (매칭 시스템)
 *
 * 기술 마스터 엔티티 (기술 스택 관리)
 */
@Entity
@Table(name = "tech")
@Getter
@NoArgsConstructor
public class Tech extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * 기술 분야 (예: Frontend, Backend, Database 등)
     */
    @Column(name = "category", length = 100)
    private String category;

    /**
     * 기술 이름 (예: React, Spring Boot, MySQL 등)
     */
    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name;

    /**
     * 생성자
     */
    public Tech(String category, String name) {
        this.category = category;
        this.name = name;
    }
}
