package com.back.domain.project.project.entity;

import com.back.domain.member.member.entity.Member;
import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 임시 엔티티 - 매칭 시스템 개발/테스트용
 * TODO: [Project 담당자] - 정식 엔티티로 교체 필요
 * 브랜치: feature/matching-temp (main merge 대기)
 * 생성: 2025-10-12 임창기 (매칭 시스템)
 *
 * 프로젝트 엔티티 (매칭 알고리즘에 필요한 최소 필드만 구현)
 */
@Entity
@Table(name = "project")
@Getter
@NoArgsConstructor
public class Project extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * 프로젝트 매니저 (PM)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pm_id", nullable = false)
    private Member pm;

    /**
     * 프로젝트 제목
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * 프로젝트 설명
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 프로젝트 분야
     */
    @Column(name = "field", length = 50)
    private String field;

    /**
     * 예산 금액
     */
    @Column(name = "budget")
    private BigDecimal budget;

    /**
     * 시작일
     */
    @Column(name = "start_date")
    private LocalDate startDate;

    /**
     * 종료일
     */
    @Column(name = "end_date")
    private LocalDate endDate;

    /**
     * 프로젝트 상태
     */
    @Column(name = "status", length = 20)
    private String status;

    /**
     * 조회수
     */
    @Column(name = "view_count")
    private Integer viewCount = 0;

    /**
     * 생성자
     */
    public Project(Member pm, String title, String description, String field, BigDecimal budget,
                   LocalDate startDate, LocalDate endDate) {
        this.pm = pm;
        this.title = title;
        this.description = description;
        this.field = field;
        this.budget = budget;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = "OPEN";
    }

    /**
     * 프로젝트 소유자 확인
     */
    public boolean isOwner(Member member) {
        return this.pm.getId().equals(member.getId());
    }
}
