package com.back.domain.matching.projectSubmission.dto;

import com.back.domain.matching.projectSubmission.entity.ProjectSubmission;
import com.back.domain.matching.projectSubmission.entity.SubmissionStatus;

import java.time.LocalDateTime;

/**
 * 프로젝트 지원 응답 DTO
 */
public record ProjectSubmissionDto(
        Long id,
        Long projectId,
        String projectTitle,
        Long freelancerId,
        String freelancerName,
        Long portfolioId,
        String coverLetter,
        SubmissionStatus status,
        LocalDateTime cancelledAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Entity를 DTO로 변환
     */
    public ProjectSubmissionDto(ProjectSubmission submission) {
        this(
                submission.getId(),
                submission.getProject().getId(),
                submission.getProject().getTitle(),
                submission.getFreelancer().getId(),
                submission.getFreelancer().getName(),
                submission.getPortfolio().getId(),
                submission.getCoverLetter(),
                submission.getStatus(),
                submission.getCancelledAt(),
                submission.getCreateDate(),
                submission.getModifyDate()
        );
    }
}
