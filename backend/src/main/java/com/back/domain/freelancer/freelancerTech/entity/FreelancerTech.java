package com.back.domain.freelancer.freelancerTech.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.tech.tech.entity.Tech;
import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 임시 엔티티 - 매칭 시스템 개발/테스트용
 * TODO: [FreelancerTech 담당자] - 정식 엔티티로 교체 필요
 * 브랜치: feature/matching-temp (main merge 대기)
 * 생성: 2025-10-12 임창기 (매칭 시스템)
 *
 * 프리랜서 보유 기술 엔티티
 */
@Entity
@Table(name = "freelancer_tech",
        uniqueConstraints = {
            @UniqueConstraint(name = "uk_freelancer_tech",
                            columnNames = {"freelancer_id", "tech_id"})
        })
@Getter
@NoArgsConstructor
public class FreelancerTech extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * 프리랜서
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    /**
     * 보유 기술
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tech_id", nullable = false)
    private Tech tech;

    /**
     * 기술 이름 (비정규화 - 조회 성능)
     */
    @Column(name = "tech_name", length = 50)
    private String techName;

    /**
     * 숙련도 (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
     */
    @Column(name = "tech_level", length = 20)
    private String proficiency;

    /**
     * 경험 년수
     */
    @Column(name = "experience_years")
    private Integer experienceYears;

    /**
     * 생성자
     */
    public FreelancerTech(Freelancer freelancer, Tech tech, String proficiency, Integer experienceYears) {
        this.freelancer = freelancer;
        this.tech = tech;
        this.techName = tech.getName();
        this.proficiency = proficiency;
        this.experienceYears = experienceYears;
    }

    /**
     * 숙련도 점수 반환 (0-10)
     */
    public int getProficiencyScore() {
        return switch (proficiency) {
            case "EXPERT" -> 10;
            case "ADVANCED" -> 7;
            case "INTERMEDIATE" -> 5;
            case "BEGINNER" -> 3;
            default -> 0;
        };
    }
}
