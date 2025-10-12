package com.back.domain.freelancer.portfolio.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 임시 엔티티 - 매칭 시스템 개발/테스트용
 * TODO: [Portfolio 담당자] - 정식 엔티티로 교체 필요
 * 브랜치: feature/matching-temp (main merge 대기)
 * 생성: 2025-10-12 임창기 (매칭 시스템)
 *
 * 프리랜서 포트폴리오 엔티티
 */
@Entity
@Table(name = "portfolio")
@Getter
@NoArgsConstructor
public class Portfolio extends BaseEntity {

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
     * 프로젝트 제목
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * 프로젝트 설명
     */
    @Column(name = "summary", columnDefinition = "TEXT")
    private String description;

    /**
     * 프로젝트 시작일
     */
    @Column(name = "start_date")
    private LocalDate startDate;

    /**
     * 프로젝트 종료일
     */
    @Column(name = "end_date")
    private LocalDate endDate;

    /**
     * 참여율 (0-100%)
     */
    @Column(name = "contribution")
    private Integer participationRate;

    /**
     * 대표 이미지 URL
     */
    @Column(name = "image_url")
    private String thumbnailUrl;

    /**
     * 포트폴리오 외부 URL (GitHub, Behance 등)
     */
    @Column(name = "external_url")
    private String externalUrl;

    /**
     * 생성자
     */
    public Portfolio(Freelancer freelancer, String title, String description,
                     LocalDate startDate, LocalDate endDate, Integer participationRate,
                     String thumbnailUrl, String externalUrl) {
        this.freelancer = freelancer;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.participationRate = participationRate;
        this.thumbnailUrl = thumbnailUrl;
        this.externalUrl = externalUrl;
    }

    /**
     * 소유자 확인
     */
    public boolean isOwner(Freelancer freelancer) {
        return this.freelancer.getId().equals(freelancer.getId());
    }
}
