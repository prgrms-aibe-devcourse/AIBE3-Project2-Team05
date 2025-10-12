package com.back.domain.matching.projectSubmission.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import com.back.domain.project.project.entity.Project;
import com.back.global.baseEntity.BaseEntity;
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
     * 제출한 포트폴리오
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    /**
     * 자기소개서 (지원 동기 및 소개)
     */
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    /**
     * 지원 상태 (PENDING, REVIEWING, APPROVED, REJECTED)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    /**
     * 지원 취소 일시
     * 프리랜서가 지원을 취소한 경우 기록
     */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    /**
     * 생성자 - 프로젝트 지원 생성
     *
     * @param project      지원할 프로젝트
     * @param freelancer   지원하는 프리랜서
     * @param portfolio    제출할 포트폴리오
     * @param coverLetter  자기소개서
     */
    public ProjectSubmission(
            Project project,
            Freelancer freelancer,
            Portfolio portfolio,
            String coverLetter
    ) {
        this.project = project;
        this.freelancer = freelancer;
        this.portfolio = portfolio;
        this.coverLetter = coverLetter;
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
     * @param portfolio    변경할 포트폴리오
     * @param coverLetter  변경할 자기소개서
     */
    public void modify(Portfolio portfolio, String coverLetter) {
        if (this.status != SubmissionStatus.PENDING) {
            throw new IllegalStateException("대기 상태에서만 지원서를 수정할 수 있습니다.");
        }
        this.portfolio = portfolio;
        this.coverLetter = coverLetter;
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
