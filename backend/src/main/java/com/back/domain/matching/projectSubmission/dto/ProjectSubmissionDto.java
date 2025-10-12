package com.back.domain.matching.projectSubmission.dto;

import com.back.domain.matching.projectSubmission.entity.ProjectSubmission;
import com.back.domain.matching.projectSubmission.entity.SubmissionStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 프로젝트 지원 응답 DTO
 */
public record ProjectSubmissionDto(
        Long id,
        Long projectId,
        String projectTitle,
        Long freelancerId,
        String freelancerName,
        String coverLetter,
        Integer proposedRate,
        Integer estimatedDuration,
        List<PortfolioItemDto> portfolio,
        SubmissionStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    private static final ObjectMapper objectMapper = new ObjectMapper();

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
                submission.getCoverLetter(),
                submission.getProposedRate(),
                submission.getEstimatedDuration(),
                parsePortfolioData(submission.getPortfolioData()),
                submission.getStatus(),
                submission.getCreateDate(),
                submission.getModifyDate()
        );
    }

    /**
     * JSON 문자열을 Portfolio 리스트로 파싱
     */
    private static List<PortfolioItemDto> parsePortfolioData(String portfolioData) {
        if (portfolioData == null || portfolioData.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(portfolioData, new TypeReference<List<PortfolioItemDto>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
