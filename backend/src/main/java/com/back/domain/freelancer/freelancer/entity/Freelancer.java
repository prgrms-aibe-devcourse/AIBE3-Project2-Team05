package com.back.domain.freelancer.freelancer.entity;

import com.back.domain.member.member.entity.Member;
import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 임시 엔티티 - 매칭 시스템 개발/테스트용
 * TODO: [Freelancer 담당자] - 정식 엔티티로 교체 필요
 * 브랜치: feature/matching-temp (main merge 대기)
 * 생성: 2025-10-12 임창기 (매칭 시스템)
 *
 * 프리랜서 엔티티 (매칭 알고리즘에 필요한 최소 필드만 구현)
 */
@Entity
@Table(name = "freelancer")
@Getter
@NoArgsConstructor
public class Freelancer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * 회원 정보 (1:1 관계)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    /**
     * 프리랜서 이름
     */
    @Column(name = "name", length = 50)
    private String name;

    /**
     * 프리랜서 형태 (개인, 팀 등)
     */
    @Column(name = "freelancer_type", length = 50)
    private String type;

    /**
     * 소개글
     */
    @Column(name = "content", columnDefinition = "TEXT")
    private String introduction;

    /**
     * 총 경력 (년)
     */
    @Column(name = "experience_years")
    private Integer totalExperience;

    /**
     * 평균 평점 (0.00 ~ 5.00)
     */
    @Column(name = "rating_avg", precision = 3, scale = 2)
    private BigDecimal averageRating;

    /**
     * 리뷰 수
     */
    @Column(name = "reviews_count")
    private Integer reviewCount = 0;

    /**
     * 월 최소 단가
     */
    @Column(name = "min_monthly_rate")
    private Integer minRate;

    /**
     * 월 최대 단가
     */
    @Column(name = "max_monthly_rate")
    private Integer maxRate;

    /**
     * 프로필 이미지 URL
     */
    @Column(name = "profile_img_url")
    private String profileImgUrl;

    /**
     * 작업 가능 여부
     */
    @Column(name = "available")
    private Boolean available = true;

    /**
     * 생성자
     */
    public Freelancer(Member member, String name, String type, String introduction,
                      Integer totalExperience, Integer minRate, Integer maxRate) {
        this.member = member;
        this.name = name;
        this.type = type;
        this.introduction = introduction;
        this.totalExperience = totalExperience;
        this.minRate = minRate;
        this.maxRate = maxRate;
        this.averageRating = BigDecimal.ZERO;
    }

    /**
     * 평점 업데이트
     */
    public void updateRating(BigDecimal newRating, int newReviewCount) {
        this.averageRating = newRating;
        this.reviewCount = newReviewCount;
    }
}
