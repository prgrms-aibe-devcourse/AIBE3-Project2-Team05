package com.back.domain.matching.projectSubmission.entity;

import com.back.domain.project.project.entity.Project;
import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 지원 상태 변경 이력 Entity
 * PM이 지원 상태를 변경할 때마다 이력을 기록
 */
@Entity
@Table(
    name = "submission_status_history",
    indexes = {
        @Index(name = "idx_submission_created", columnList = "submission_id, create_date"),
        @Index(name = "idx_project_created", columnList = "project_id, create_date")
    }
)
@Getter
@NoArgsConstructor
public class SubmissionStatusHistory extends BaseEntity {

    /**
     * 상태 변경된 지원
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private ProjectSubmission submission;

    /**
     * 지원 대상 프로젝트
     * 조회 성능을 위해 비정규화
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * 이전 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", nullable = false)
    private SubmissionStatus previousStatus;

    /**
     * 변경된 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private SubmissionStatus currentStatus;

    /**
     * 변경 사유
     * PM이 상태를 변경한 이유
     */
    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;

    /**
     * 상태 변경 일시
     * BaseEntity의 createDate와 동일하지만, 명시적으로 관리
     */
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    /**
     * 생성자 - 상태 변경 이력 생성
     *
     * @param submission      지원
     * @param project         프로젝트
     * @param previousStatus  이전 상태
     * @param currentStatus   변경된 상태
     * @param changeReason    변경 사유
     */
    public SubmissionStatusHistory(
            ProjectSubmission submission,
            Project project,
            SubmissionStatus previousStatus,
            SubmissionStatus currentStatus,
            String changeReason
    ) {
        this.submission = submission;
        this.project = project;
        this.previousStatus = previousStatus;
        this.currentStatus = currentStatus;
        this.changeReason = changeReason;
        this.changedAt = LocalDateTime.now();
    }
}
