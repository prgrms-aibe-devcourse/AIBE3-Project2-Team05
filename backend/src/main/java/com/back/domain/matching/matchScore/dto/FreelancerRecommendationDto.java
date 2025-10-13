package com.back.domain.matching.matchScore.dto;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.matching.matchScore.entity.MatchScore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 프리랜서 추천 응답 DTO
 */
public record FreelancerRecommendationDto(
        Long freelancerId,
        String freelancerName,
        Integer totalExperience,
        Double averageRating,
        Integer minRate,
        Integer maxRate,
        Boolean available,
        Double matchingScore,
        Double skillScore,
        Double experienceScore,
        Double budgetScore,
        Integer rank,
        Map<String, Object> matchingReasons,
        List<FreelancerTechDto> skills,
        Long completedProjects
) {
    /**
     * MatchScore를 FreelancerRecommendationDto로 변환
     *
     * @param matchScore      매칭 점수 엔티티
     * @param freelancerTechs 프리랜서 기술 목록
     * @param completedProjects 완료 프로젝트 수
     */
    public FreelancerRecommendationDto(MatchScore matchScore,
                                      List<FreelancerTech> freelancerTechs,
                                      Long completedProjects) {
        this(
                matchScore.getFreelancer().getId(),
                matchScore.getFreelancer().getName(),
                matchScore.getFreelancer().getTotalExperience(),
                extractAverageRating(matchScore.getFreelancer().getAverageRating()),
                matchScore.getFreelancer().getMinRate(),
                matchScore.getFreelancer().getMaxRate(),
                matchScore.getFreelancer().getAvailable(),
                matchScore.getScoreTotal().doubleValue(),
                matchScore.getScoreSkills().doubleValue(),
                matchScore.getScoreExperience().doubleValue(),
                matchScore.getScoreBudget().doubleValue(),
                matchScore.getRank(),
                extractMatchingReasonsMap(matchScore),
                extractSkillDtos(freelancerTechs),
                completedProjects
        );
    }

    /**
     * 프리랜서 기술 DTO 목록 생성
     */
    private static List<FreelancerTechDto> extractSkillDtos(List<FreelancerTech> freelancerTechs) {
        return freelancerTechs.stream()
                .map(tech -> new FreelancerTechDto(
                        tech.getTechName(),
                        tech.getProficiency()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 평균 평점 추출
     */
    private static Double extractAverageRating(BigDecimal averageRating) {
        return (averageRating != null) ? averageRating.doubleValue() : 0.0;
    }

    /**
     * 매칭 이유 추출 (JSON에서 Map으로 파싱)
     */
    private static Map<String, Object> extractMatchingReasonsMap(MatchScore matchScore) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(
                    matchScore.getMatchReason(),
                    new TypeReference<Map<String, Object>>() {}
            );
        } catch (Exception e) {
            return Map.of("error", "매칭 점수 기반 추천");
        }
    }
}
