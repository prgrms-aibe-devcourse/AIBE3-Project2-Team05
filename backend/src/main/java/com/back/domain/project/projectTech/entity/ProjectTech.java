package com.back.domain.project.projectTech.entity;

import com.back.domain.project.project.entity.Project;
import com.back.domain.tech.tech.entity.Tech;
import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 임시 엔티티 - 매칭 시스템 개발/테스트용
 * TODO: [ProjectTech 담당자] - 정식 엔티티로 교체 필요
 * 브랜치: feature/matching-temp (main merge 대기)
 * 생성: 2025-10-12 임창기 (매칭 시스템)
 *
 * 프로젝트 요구 기술 엔티티
 */
@Entity
@Table(name = "project_tech",
        uniqueConstraints = {
            @UniqueConstraint(name = "uk_project_tech",
                            columnNames = {"project_id", "tech_id"})
        })
@Getter
@NoArgsConstructor
public class ProjectTech extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * 프로젝트
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * 요구 기술
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tech_id", nullable = false)
    private Tech tech;

    /**
     * 기술 분야 (비정규화 - 조회 성능)
     */
    @Column(name = "category", length = 50)
    private String category;

    /**
     * 기술 이름 (비정규화 - 조회 성능)
     */
    @Column(name = "tech_name", length = 50)
    private String techName;

    /**
     * 필수 여부
     */
    @Column(name = "required")
    private Boolean required = true;

    /**
     * 생성자
     */
    public ProjectTech(Project project, Tech tech, Boolean required) {
        this.project = project;
        this.tech = tech;
        this.category = tech.getCategory();
        this.techName = tech.getName();
        this.required = required;
    }
}
