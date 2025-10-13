package com.back.domain.matching.matchScore.service;

import com.back.domain.freelancer.career.repository.CareerRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.repository.FreelancerTechRepository;
import com.back.domain.freelancer.portfolio.repository.PortfolioRepository;
import com.back.domain.matching.matchScore.entity.MatchScore;
import com.back.domain.matching.matchScore.repository.MatchScoreRepository;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.project.projectTech.repository.ProjectTechRepository;
import com.back.global.exception.ServiceException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 매칭 점수 Service
 * 프로젝트와 프리랜서 간의 매칭 점수를 계산하고 관리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchScoreService {

    private final MatchScoreRepository matchScoreRepository;
    private final ProjectRepository projectRepository;
    private final FreelancerRepository freelancerRepository;
    private final ProjectTechRepository projectTechRepository;
    private final FreelancerTechRepository freelancerTechRepository;
    private final CareerRepository careerRepository;
    private final PortfolioRepository portfolioRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 점수 배점
    private static final double MAX_SKILL_SCORE = 50.0;      // 스킬 점수 최대 50점
    private static final double MAX_EXPERIENCE_SCORE = 30.0; // 경력 점수 최대 30점
    private static final double MAX_BUDGET_SCORE = 20.0;     // 단가 점수 최대 20점
    private static final int TOP_N = 10;                     // Top 10 추천

    /**
     * 프로젝트의 추천 프리랜서 계산 및 저장
     *
     * @param projectId 프로젝트 ID
     * @return 생성된 매칭 점수 개수
     */
    @Transactional
    public int calculateAndSaveRecommendations(Long projectId) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // 프로젝트 요구 기술 조회
        List<String> requiredTechNames = projectTechRepository.findTechNamesByProjectId(projectId);

        if (requiredTechNames.isEmpty()) {
            throw new ServiceException("400-1", "프로젝트에 요구 기술이 설정되지 않았습니다.");
        }

        // 작업 가능한 모든 프리랜서 조회
        List<Freelancer> availableFreelancers = freelancerRepository.findByAvailableTrue();

        // 각 프리랜서별 매칭 점수 계산
        List<MatchScoreData> scoreDataList = new ArrayList<>();

        for (Freelancer freelancer : availableFreelancers) {
            MatchScoreData scoreData = calculateMatchScore(project, freelancer, requiredTechNames);
            scoreDataList.add(scoreData);
        }

        // 점수순 정렬 및 Top 10 선정
        List<MatchScoreData> topScores = scoreDataList.stream()
                .sorted(Comparator.comparing(MatchScoreData::getTotalScore).reversed())
                .limit(TOP_N)
                .collect(Collectors.toList());

        // 순위 매기기 및 저장
        int rank = 1;
        for (MatchScoreData scoreData : topScores) {
            MatchScore matchScore = new MatchScore(
                    project,
                    scoreData.getFreelancer(),
                    scoreData.getTotalScore(),
                    scoreData.getSkillScore(),
                    scoreData.getExperienceScore(),
                    scoreData.getBudgetScore(),
                    rank++,
                    scoreData.getReasonsJson(),
                    LocalDateTime.now()
            );
            matchScoreRepository.save(matchScore);
        }

        return topScores.size();
    }

    /**
     * 매칭 점수 계산 (프로젝트 + 프리랜서)
     */
    private MatchScoreData calculateMatchScore(Project project, Freelancer freelancer, List<String> requiredTechNames) {
        // 1. 스킬 점수 계산 (50점)
        BigDecimal skillScore = calculateSkillScore(freelancer, requiredTechNames);

        // 2. 경력 점수 계산 (30점)
        BigDecimal experienceScore = calculateExperienceScore(freelancer);

        // 3. 단가 점수 계산 (20점)
        BigDecimal budgetScore = calculateBudgetScore(project, freelancer);

        // 4. 총점 계산
        BigDecimal totalScore = skillScore.add(experienceScore).add(budgetScore)
                .setScale(2, RoundingMode.HALF_UP);

        // 5. 매칭 이유 생성
        Map<String, Object> reasons = generateMatchingReasons(freelancer, requiredTechNames, skillScore, experienceScore, budgetScore, project);
        String reasonsJson = convertToJson(reasons);

        return new MatchScoreData(freelancer, totalScore, skillScore, experienceScore, budgetScore, reasonsJson);
    }

    /**
     * 스킬 점수 계산 (50점 만점)
     * - 프로젝트 요구 기술과 프리랜서 보유 기술 매칭률
     * - 숙련도 가중치 적용
     */
    private BigDecimal calculateSkillScore(Freelancer freelancer, List<String> requiredTechNames) {
        // 프리랜서 보유 기술 조회
        List<FreelancerTech> freelancerTechs = freelancerTechRepository.findByFreelancer(freelancer);

        if (freelancerTechs.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // 매칭된 기술 개수와 숙련도 점수 계산
        double matchedSkillScore = 0.0;

        for (String requiredTech : requiredTechNames) {
            Optional<FreelancerTech> matchedTech = freelancerTechs.stream()
                    .filter(ft -> ft.getTechName().equalsIgnoreCase(requiredTech))
                    .findFirst();

            if (matchedTech.isPresent()) {
                // 숙련도에 따른 가중치
                double proficiencyWeight = getProficiencyWeight(matchedTech.get().getProficiency());
                matchedSkillScore += proficiencyWeight;
            }
        }

        // 매칭률 계산: (매칭된 기술 점수 / 요구 기술 수) × 60
        double matchRate = matchedSkillScore / requiredTechNames.size();
        double skillScore = Math.min(matchRate * MAX_SKILL_SCORE, MAX_SKILL_SCORE);

        return BigDecimal.valueOf(skillScore).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 숙련도 가중치 반환
     */
    private double getProficiencyWeight(String proficiency) {
        return switch (proficiency) {
            case "EXPERT" -> 1.0;
            case "ADVANCED" -> 0.8;
            case "INTERMEDIATE" -> 0.6;
            case "BEGINNER" -> 0.4;
            default -> 0.0;
        };
    }

    /**
     * 경력 점수 계산 (30점 만점)
     * - 총 경력 연수 (15점)
     * - 완료 프로젝트 수 (8점)
     * - 평균 평점 (7점)
     */
    private BigDecimal calculateExperienceScore(Freelancer freelancer) {
        double totalScore = 0.0;

        // 1. 총 경력 연수 점수 (15점): 10년 이상이면 만점
        Integer totalExperience = freelancer.getTotalExperience();
        if (totalExperience != null && totalExperience > 0) {
            double experienceScore = Math.min((totalExperience / 10.0) * 15, 15.0);
            totalScore += experienceScore;
        }

        // 2. 완료 프로젝트 수 (8점): 10개 이상이면 만점
        long completedProjects = portfolioRepository.countByFreelancer(freelancer);
        double projectScore = Math.min((completedProjects / 10.0) * 8, 8.0);
        totalScore += projectScore;

        // 3. 평균 평점 (7점): 5점 만점 기준
        BigDecimal averageRating = freelancer.getAverageRating();
        if (averageRating != null && averageRating.compareTo(BigDecimal.ZERO) > 0) {
            double ratingScore = averageRating.doubleValue() / 5.0 * 7.0;
            totalScore += ratingScore;
        }

        return BigDecimal.valueOf(totalScore).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 단가 점수 계산 (20점 만점)
     * - 프로젝트 예산과 프리랜서 희망 단가 비교
     */
    private BigDecimal calculateBudgetScore(Project project, Freelancer freelancer) {
        BigDecimal projectBudget = project.getBudget();
        Integer freelancerMinRate = freelancer.getMinRate();
        Integer freelancerMaxRate = freelancer.getMaxRate();

        // 예산이나 단가 정보가 없으면 중간 점수 (10점)
        if (projectBudget == null || freelancerMinRate == null || freelancerMaxRate == null) {
            return BigDecimal.valueOf(10.0);
        }

        double budget = projectBudget.doubleValue();
        double minRate = freelancerMinRate.doubleValue();
        double maxRate = freelancerMaxRate.doubleValue();

        double score;

        if (budget >= minRate && budget <= maxRate) {
            // 예산이 희망 단가 범위 내: 만점
            score = MAX_BUDGET_SCORE;
        } else if (budget > maxRate) {
            // 예산이 최대 단가보다 높음: 15점 (예산 여유)
            score = 15.0;
        } else if (budget >= minRate * 0.8) {
            // 예산이 최소 단가의 80% 이상: 10점 (협상 가능)
            score = 10.0;
        } else if (budget >= minRate * 0.6) {
            // 예산이 최소 단가의 60% 이상: 5점 (협상 어려움)
            score = 5.0;
        } else {
            // 예산이 최소 단가의 60% 미만: 0점 (매칭 불가능)
            score = 0.0;
        }

        return BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 매칭 이유 생성 (JSON)
     */
    private Map<String, Object> generateMatchingReasons(Freelancer freelancer, List<String> requiredTechNames,
                                                         BigDecimal skillScore, BigDecimal experienceScore,
                                                         BigDecimal budgetScore, Project project) {
        Map<String, Object> reasons = new HashMap<>();

        // 매칭된 기술 목록
        List<FreelancerTech> freelancerTechs = freelancerTechRepository.findByFreelancer(freelancer);
        List<String> matchedSkills = freelancerTechs.stream()
                .map(FreelancerTech::getTechName)
                .filter(requiredTechNames::contains)
                .collect(Collectors.toList());

        reasons.put("matched_skills", matchedSkills);
        reasons.put("skill_score", skillScore.doubleValue());
        reasons.put("experience_years", freelancer.getTotalExperience());
        reasons.put("experience_score", experienceScore.doubleValue());
        reasons.put("completed_projects", portfolioRepository.countByFreelancer(freelancer));
        reasons.put("average_rating", freelancer.getAverageRating());
        reasons.put("budget_score", budgetScore.doubleValue());
        reasons.put("project_budget", project.getBudget());
        reasons.put("freelancer_min_rate", freelancer.getMinRate());
        reasons.put("freelancer_max_rate", freelancer.getMaxRate());

        return reasons;
    }

    /**
     * Map을 JSON 문자열로 변환
     */
    private String convertToJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    /**
     * 특정 프리랜서의 매칭 점수만 재계산
     * 프리랜서가 자신의 정보를 업데이트했을 때 사용
     *
     * @param projectId    프로젝트 ID
     * @param freelancerId 프리랜서 ID
     */
    @Transactional
    public void calculateAndSaveForFreelancer(Long projectId, Long freelancerId) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // 프리랜서 조회
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프리랜서입니다."));

        // 프로젝트 요구 기술 조회
        List<String> requiredTechNames = projectTechRepository.findTechNamesByProjectId(projectId);

        if (requiredTechNames.isEmpty()) {
            throw new ServiceException("400-1", "프로젝트에 요구 기술이 설정되지 않았습니다.");
        }

        // 기존 매칭 점수 삭제
        matchScoreRepository.deleteByProjectAndFreelancer(project, freelancer);

        // 매칭 점수 재계산
        MatchScoreData scoreData = calculateMatchScore(project, freelancer, requiredTechNames);

        // 전체 매칭 점수 조회하여 순위 계산
        List<MatchScore> allScores = matchScoreRepository.findByProjectOrderByScoreTotalDesc(project);
        int rank = 1;
        for (MatchScore score : allScores) {
            if (scoreData.getTotalScore().compareTo(score.getScoreTotal()) > 0) {
                break;
            }
            rank++;
        }

        // 새로운 매칭 점수 저장
        MatchScore matchScore = new MatchScore(
                project,
                freelancer,
                scoreData.getTotalScore(),
                scoreData.getSkillScore(),
                scoreData.getExperienceScore(),
                scoreData.getBudgetScore(),
                rank,
                scoreData.getReasonsJson(),
                LocalDateTime.now()
        );
        matchScoreRepository.save(matchScore);
    }

    /**
     * 프로젝트의 추천 프리랜서 조회
     *
     * @param projectId 프로젝트 ID
     * @param limit     조회 개수
     * @param minScore  최소 점수
     * @return 추천 프리랜서 목록
     */
    public List<MatchScore> getRecommendations(Long projectId, Integer limit, Double minScore) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        if (minScore != null) {
            return matchScoreRepository.findByProjectAndMinScore(project, minScore);
        }

        return matchScoreRepository.findTopRecommendations(project, limit != null ? limit : TOP_N);
    }

    /**
     * 내부 데이터 클래스: 매칭 점수 계산 결과
     */
    private static class MatchScoreData {
        private final Freelancer freelancer;
        private final BigDecimal totalScore;
        private final BigDecimal skillScore;
        private final BigDecimal experienceScore;
        private final BigDecimal budgetScore;
        private final String reasonsJson;

        public MatchScoreData(Freelancer freelancer, BigDecimal totalScore, BigDecimal skillScore,
                             BigDecimal experienceScore, BigDecimal budgetScore, String reasonsJson) {
            this.freelancer = freelancer;
            this.totalScore = totalScore;
            this.skillScore = skillScore;
            this.experienceScore = experienceScore;
            this.budgetScore = budgetScore;
            this.reasonsJson = reasonsJson;
        }

        public Freelancer getFreelancer() { return freelancer; }
        public BigDecimal getTotalScore() { return totalScore; }
        public BigDecimal getSkillScore() { return skillScore; }
        public BigDecimal getExperienceScore() { return experienceScore; }
        public BigDecimal getBudgetScore() { return budgetScore; }
        public String getReasonsJson() { return reasonsJson; }
    }
}
