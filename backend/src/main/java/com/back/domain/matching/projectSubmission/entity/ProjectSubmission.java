package com.back.domain.matching.projectSubmission.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.entity.Project;
import com.back.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 프로젝트 지원 Entity
 * 프리랜서가 프로젝트에 지원하는 정보를 저장
 */
@Entity
@Table(
    name = "project_submissions",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_project_freelancer",
            columnNames = {"project_id", "freelancer_id"}
        )
    },
    indexes = {
        @Index(name = "idx_project_status", columnList = "project_id, status"),
        @Index(name = "idx_freelancer_status", columnList = "freelancer_id, status"),
        @Index(name = "idx_created_at", columnList = "createDate")
    }
)
@Getter
@NoArgsConstructor
public class ProjectSubmission extends BaseEntity {

    /**
     * 지원 대상 프로젝트
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * 지원한 프리랜서
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    /**
     * 자기소개서 (지원 동기 및 소개)
     */
    @Column(name = "cover_letter", columnDefinition = "TEXT", nullable = false)
    private String coverLetter;

    /**
     * 제안 단가 (시간당, 원)
     */
    @Column(name = "proposed_rate", nullable = false)
    private Integer proposedRate;

    /**
     * 예상 소요 기간 (일)
     */
    @Column(name = "estimated_duration", nullable = false)
    private Integer estimatedDuration;

    /**
     * 포트폴리오 데이터 (JSON 형식)
     * 예시: [{"title":"프로젝트명","description":"설명","url":"https://...","thumbnailUrl":"https://..."}]
     */
    @Column(name = "portfolio_data", columnDefinition = "JSON")
    private String portfolioData;

    /**
     * 지원 상태 (PENDING, ACCEPTED, REJECTED)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    /**
     * 지원 취소 일시
     * 프리랜서가 지원을 취소한 경우 기록
     */
    @Column(name = "cancelled_date")
    private LocalDateTime cancelledAt;

    /**
     * 생성자 - 프로젝트 지원 생성
     *
     * @param project           지원할 프로젝트
     * @param freelancer        지원하는 프리랜서
     * @param coverLetter       자기소개서
     * @param proposedRate      제안 단가 (시간당)
     * @param estimatedDuration 예상 소요 기간 (일)
     * @param portfolioData     포트폴리오 데이터 (JSON)
     */
    public ProjectSubmission(
            Project project,
            Freelancer freelancer,
            String coverLetter,
            Integer proposedRate,
            Integer estimatedDuration,
            String portfolioData
    ) {
        this.project = project;
        this.freelancer = freelancer;
        this.coverLetter = coverLetter;
        this.proposedRate = proposedRate;
        this.estimatedDuration = estimatedDuration;
        this.portfolioData = portfolioData;
        this.status = SubmissionStatus.PENDING;
    }

    /**
     * 지원 상태 변경
     * PM이 지원 상태를 변경할 때 사용
     *
     * @param newStatus 변경할 상태
     */
    public void updateStatus(SubmissionStatus newStatus) {
        this.status = newStatus;
    }

    /**
     * 지원 취소
     * 프리랜서가 지원을 취소할 때 사용
     */
    public void cancel() {
        this.cancelledAt = LocalDateTime.now();
        this.status = SubmissionStatus.REJECTED;
    }

    /**
     * 취소 여부 확인
     *
     * @return 취소되었으면 true
     */
    public boolean isCancelled() {
        return this.cancelledAt != null;
    }

    /**
     * 지원서 수정
     * 대기 상태일 때만 수정 가능
     *
     * @param coverLetter       변경할 자기소개서
     * @param proposedRate      변경할 제안 단가
     * @param estimatedDuration 변경할 예상 소요 기간
     * @param portfolioData     변경할 포트폴리오 데이터
     */
    public void modify(String coverLetter, Integer proposedRate, Integer estimatedDuration, String portfolioData) {
        if (this.status != SubmissionStatus.PENDING) {
            throw new IllegalStateException("대기 상태에서만 지원서를 수정할 수 있습니다.");
        }
        this.coverLetter = coverLetter;
        this.proposedRate = proposedRate;
        this.estimatedDuration = estimatedDuration;
        this.portfolioData = portfolioData;
    }

    /**
     * 프리랜서 권한 확인
     * 본인만 지원서를 취소하거나 수정할 수 있는지 확인
     *
     * @param freelancer 확인할 프리랜서
     * @return 본인이면 true
     */
    public boolean isOwner(Freelancer freelancer) {
        return this.freelancer.getId().equals(freelancer.getId());
    }
}
