package com.back.domain.freelancer.career.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 임시 엔티티 - 매칭 시스템 개발/테스트용
 * TODO: [Career 담당자] - 정식 엔티티로 교체 필요
 * 브랜치: feature/matching-temp (main merge 대기)
 * 생성: 2025-10-12 임창기 (매칭 시스템)
 *
 * 프리랜서 경력 엔티티
 */
@Entity
@Table(name = "career")
@Getter
@NoArgsConstructor
public class Career extends BaseEntity {

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
     * 회사명
     */
    @Column(name = "company_name", length = 200)
    private String companyName;

    /**
     * 직책/역할
     */
    @Column(name = "position", length = 200)
    private String position;

    /**
     * 시작일
     */
    @Column(name = "start_date")
    private LocalDate startDate;

    /**
     * 종료일 (재직중이면 null)
     */
    @Column(name = "end_date")
    private LocalDate endDate;

    /**
     * 재직 여부
     */
    @Column(name = "is_current")
    private Boolean isCurrent = false;

    /**
     * 업무 설명
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 생성자
     */
    public Career(Freelancer freelancer, String companyName, String position,
                  LocalDate startDate, LocalDate endDate, Boolean isCurrent, String description) {
        this.freelancer = freelancer;
        this.companyName = companyName;
        this.position = position;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent;
        this.description = description;
    }

    /**
     * 경력 기간 계산 (년 단위)
     */
    public int getYearsOfExperience() {
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        return end.getYear() - startDate.getYear();
    }
}
