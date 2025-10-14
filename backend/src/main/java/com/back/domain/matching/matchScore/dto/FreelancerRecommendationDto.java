package com.back.domain.matching.matchScore.dto;

import com.back.domain.freelancer.career.entity.Career;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.matching.matchScore.entity.MatchScore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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
                matchScore.getFreelancer().getMemberNickname(),
                extractTotalExperience(matchScore.getFreelancer()),
                extractAverageRating(matchScore.getFreelancer()),
                matchScore.getFreelancer().getMinMonthlyRate(),
                matchScore.getFreelancer().getMaxMonthlyRate(),
                Boolean.TRUE,
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
                        tech.getTech() != null ? tech.getTech().getTechName() : null,
                        tech.getTechLevel()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 평균 평점 추출
     */
    private static Double extractAverageRating(Freelancer freelancer) {
        double ratingAvg = freelancer.getRatingAvg();
        return ratingAvg > 0 ? ratingAvg : 0.0;
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

    /**
     * 총 경력 연차 계산 (년 단위 반올림)
     */
    private static Integer extractTotalExperience(Freelancer freelancer) {
        return freelancer.getCareerList().stream()
                .mapToInt(FreelancerRecommendationDto::calculateCareerYears)
                .sum();
    }

    private static int calculateCareerYears(Career career) {
        if (career.getStartDate() == null) {
            return 0;
        }

        LocalDate endDate = career.getEndDate();
        if (Boolean.TRUE.equals(career.getCurrent()) || endDate == null) {
            endDate = LocalDate.now();
        }

        if (endDate.isBefore(career.getStartDate())) {
            return 0;
        }

        long months = ChronoUnit.MONTHS.between(career.getStartDate(), endDate);
        if (months <= 0) {
            return 0;
        }

        return (int) Math.round(months / 12.0);
    }
}
