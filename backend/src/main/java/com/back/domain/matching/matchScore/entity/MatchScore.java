package com.back.domain.matching.matchScore.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 매칭 점수 Entity
 * 프로젝트와 프리랜서 간의 매칭 점수를 저장
 * 복합키 (project_id, freelancer_id) 사용
 */
@Entity
@Table(name = "match_scores")
@Getter
@NoArgsConstructor
public class MatchScore {

    /**
     * 복합키 (project_id, freelancer_id)
     */
    @EmbeddedId
    private MatchScoreId id;

    /**
     * 연관된 프로젝트
     * 성능 최적화를 위한 LAZY 로딩
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("projectId")
    @JoinColumn(name = "project_id")
    private Project project;

    /**
     * 연관된 프리랜서
     * 성능 최적화를 위한 LAZY 로딩
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("freelancerMemberId")
    @JoinColumn(name = "freelancer_member_id")
    private Freelancer freelancer;

    /**
     * 총 매칭 점수 (0-100)
     */
    @Column(name = "score_total", precision = 5, scale = 2)
    private BigDecimal scoreTotal;

    /**
     * 스킬 매칭 점수
     */
    @Column(name = "score_skills", precision = 5, scale = 2)
    private BigDecimal scoreSkills;

    /**
     * 경력 매칭 점수
     */
    @Column(name = "score_experience", precision = 5, scale = 2)
    private BigDecimal scoreExperience;

    /**
     * 매칭 순위 (1-10)
     */
    @Column(name = "`rank`")
    private Integer rank;

    /**
     * 상세 매칭 이유 (JSON 형식)
     * 예시: {"skill_matches": ["Spring Boot", "React"], "location_match": true}
     */
    @Column(name = "match_reason", columnDefinition = "JSON")
    private String matchReason;

    /**
     * 추천 일자
     */
    @Column(name = "recommended_at")
    private LocalDateTime recommendedAt;

    /**
     * 생성자 - 매칭 점수 생성
     *
     * @param project          연관된 프로젝트
     * @param freelancer       연관된 프리랜서
     * @param scoreTotal       총 매칭 점수
     * @param scoreSkill       스킬 매칭 점수
     * @param scoreExperience  경력 매칭 점수
     * @param rank             매칭 순위 (1-10)
     * @param reasons          매칭 이유 (JSON 형식)
     * @param recommendedAt    추천 일자
     */
    public MatchScore(
            Project project,
            Freelancer freelancer,
            BigDecimal scoreTotal,
            BigDecimal scoreSkills,
            BigDecimal scoreExperience,
            Integer rank,
            String matchReason,
            LocalDateTime recommendedAt
    ) {
        this.id = new MatchScoreId(project.getId(), freelancer.getId());
        this.project = project;
        this.freelancer = freelancer;
        this.scoreTotal = scoreTotal;
        this.scoreSkills = scoreSkills;
        this.scoreExperience = scoreExperience;
        this.rank = rank;
        this.matchReason = matchReason;
        this.recommendedAt = recommendedAt;
    }

    /**
     * 매칭 점수 업데이트
     * 추천 점수를 재계산할 때 사용
     *
     * @param scoreTotal      업데이트할 총 점수
     * @param scoreSkills     업데이트할 스킬 점수
     * @param scoreExperience 업데이트할 경력 점수
     * @param rank            업데이트할 순위
     * @param matchReason     업데이트할 매칭 이유
     */
    public void updateScore(
            BigDecimal scoreTotal,
            BigDecimal scoreSkills,
            BigDecimal scoreExperience,
            Integer rank,
            String matchReason
    ) {
        this.scoreTotal = scoreTotal;
        this.scoreSkills = scoreSkills;
        this.scoreExperience = scoreExperience;
        this.rank = rank;
        this.matchReason = matchReason;
        this.recommendedAt = LocalDateTime.now();
    }
}
