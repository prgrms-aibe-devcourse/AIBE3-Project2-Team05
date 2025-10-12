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
        String name,
        String profileImgUrl,
        Double matchingScore,
        List<String> skills,
        Integer experienceYears,
        Long completedProjects,
        Double averageRating,
        Integer hourlyRate,
        String availability,
        List<String> matchingReasons
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
                matchScore.getFreelancer().getProfileImgUrl(),
                matchScore.getScoreTotal().doubleValue(),
                extractSkills(freelancerTechs),
                matchScore.getFreelancer().getTotalExperience(),
                completedProjects,
                extractAverageRating(matchScore.getFreelancer().getAverageRating()),
                calculateHourlyRate(matchScore.getFreelancer()),
                getAvailabilityText(matchScore.getFreelancer()),
                extractMatchingReasons(matchScore)
        );
    }

    /**
     * 프리랜서 기술 목록 추출
     */
    private static List<String> extractSkills(List<FreelancerTech> freelancerTechs) {
        return freelancerTechs.stream()
                .map(FreelancerTech::getTechName)
                .collect(Collectors.toList());
    }

    /**
     * 평균 평점 추출
     */
    private static Double extractAverageRating(BigDecimal averageRating) {
        return (averageRating != null) ? averageRating.doubleValue() : 0.0;
    }

    /**
     * 시간당 단가 계산 (월 단가의 중간값을 시간당으로 환산)
     * 월 160시간 기준
     */
    private static Integer calculateHourlyRate(Freelancer freelancer) {
        if (freelancer.getMinRate() != null && freelancer.getMaxRate() != null) {
            int avgMonthlyRate = (freelancer.getMinRate() + freelancer.getMaxRate()) / 2;
            return avgMonthlyRate / 160; // 월 160시간 기준
        }
        return 0;
    }

    /**
     * 작업 가능 여부 텍스트
     */
    private static String getAvailabilityText(Freelancer freelancer) {
        return (freelancer.getAvailable() != null && freelancer.getAvailable())
                ? "즉시 가능"
                : "협의 필요";
    }

    /**
     * 매칭 이유 추출 (JSON에서 파싱)
     */
    private static List<String> extractMatchingReasons(MatchScore matchScore) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> reasons = objectMapper.readValue(
                    matchScore.getReasons(),
                    new TypeReference<Map<String, Object>>() {}
            );

            List<String> reasonList = new java.util.ArrayList<>();

            // 매칭된 기술
            @SuppressWarnings("unchecked")
            List<String> matchedSkills = (List<String>) reasons.get("matched_skills");
            if (matchedSkills != null && !matchedSkills.isEmpty()) {
                reasonList.add(String.format("요구 기술 보유: %s", String.join(", ", matchedSkills)));
            }

            // 경력
            Object experienceYears = reasons.get("experience_years");
            if (experienceYears != null && ((Number) experienceYears).intValue() > 0) {
                reasonList.add(String.format("경력 %d년", ((Number) experienceYears).intValue()));
            }

            // 완료 프로젝트
            Object completedProjects = reasons.get("completed_projects");
            if (completedProjects != null && ((Number) completedProjects).intValue() > 0) {
                reasonList.add(String.format("완료 프로젝트 %d개", ((Number) completedProjects).intValue()));
            }

            // 평점
            Object averageRating = reasons.get("average_rating");
            if (averageRating != null) {
                double rating = ((Number) averageRating).doubleValue();
                if (rating >= 4.0) {
                    reasonList.add(String.format("높은 평점 (%.1f/5.0)", rating));
                }
            }

            return reasonList.isEmpty()
                    ? List.of("매칭 점수 기반 추천")
                    : reasonList;

        } catch (Exception e) {
            return List.of("매칭 점수 기반 추천");
        }
    }
}
