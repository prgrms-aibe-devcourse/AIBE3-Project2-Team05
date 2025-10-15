package com.back.domain.matching.matchScore.dto;

import java.util.List;

/**
 * 프리랜서 추천 목록 응답 DTO
 */
public record RecommendationResponseDto(
        Long projectId,
        String projectTitle,
        Integer totalRecommendations,
        List<FreelancerRecommendationDto> recommendations
) {
    /**
     * 생성자
     */
    public RecommendationResponseDto(Long projectId, String projectTitle,
                                    List<FreelancerRecommendationDto> recommendations) {
        this(projectId, projectTitle, recommendations.size(), recommendations);
    }
}
