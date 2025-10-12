package com.back.domain.matching.matchScore.controller;

import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.repository.FreelancerTechRepository;
import com.back.domain.freelancer.portfolio.repository.PortfolioRepository;
import com.back.domain.matching.matchScore.dto.FreelancerRecommendationDto;
import com.back.domain.matching.matchScore.dto.RecommendationResponseDto;
import com.back.domain.matching.matchScore.entity.MatchScore;
import com.back.domain.matching.matchScore.service.MatchScoreService;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.global.exception.ServiceException;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 매칭 API Controller
 */
@RestController
@RequestMapping("/api/v1/matching")
@RequiredArgsConstructor
public class ApiV1MatchingController {

    private final MatchScoreService matchScoreService;
    private final ProjectRepository projectRepository;
    private final FreelancerTechRepository freelancerTechRepository;
    private final PortfolioRepository portfolioRepository;

    /**
     * 프리랜서 추천 조회
     * 특정 프로젝트에 적합한 프리랜서 목록을 AI 기반으로 추천합니다.
     *
     * @param user      현재 로그인한 사용자 (PM)
     * @param projectId 프로젝트 ID
     * @param limit     추천 결과 개수 (기본값: 10)
     * @param minScore  최소 매칭 점수 (기본값: 60)
     * @return 추천 프리랜서 목록
     */
    @GetMapping("/recommend/{projectId}")
    public RsData<RecommendationResponseDto> getRecommendations(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long projectId,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "60") Double minScore
    ) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // 프로젝트 소유자 확인 (PM만 추천 조회 가능)
        if (user == null) {
            throw new ServiceException("401-1", "로그인이 필요합니다.");
        }
        if (!project.isOwner(user.getMember())) {
            throw new ServiceException("403-1", "프로젝트 소유자만 추천을 조회할 수 있습니다.");
        }

        // 매칭 점수 조회 (없으면 계산)
        List<MatchScore> matchScores = matchScoreService.getRecommendations(projectId, limit, minScore);

        // 매칭 점수가 없으면 계산 후 다시 조회
        if (matchScores.isEmpty()) {
            int calculatedCount = matchScoreService.calculateAndSaveRecommendations(projectId);

            if (calculatedCount == 0) {
                throw new ServiceException("404-1", "추천할 프리랜서가 없습니다. 프로젝트 요구 기술을 확인해주세요.");
            }

            matchScores = matchScoreService.getRecommendations(projectId, limit, minScore);
        }

        // DTO 변환
        List<FreelancerRecommendationDto> recommendations = matchScores.stream()
                .map(matchScore -> {
                    // 프리랜서 기술 목록 조회
                    List<FreelancerTech> freelancerTechs = freelancerTechRepository
                            .findByFreelancer(matchScore.getFreelancer());

                    // 완료 프로젝트 수 조회
                    Long completedProjects = portfolioRepository
                            .countByFreelancer(matchScore.getFreelancer());

                    return new FreelancerRecommendationDto(matchScore, freelancerTechs, completedProjects);
                })
                .collect(Collectors.toList());

        RecommendationResponseDto responseDto = new RecommendationResponseDto(
                project.getId(),
                project.getTitle(),
                recommendations
        );

        return new RsData<>(
                "200-1",
                "프리랜서 추천 목록이 조회되었습니다.",
                responseDto
        );
    }

    /**
     * 매칭 점수 재계산
     * 프로젝트의 매칭 점수를 다시 계산합니다.
     *
     * @param user      현재 로그인한 사용자 (PM)
     * @param projectId 프로젝트 ID
     * @return 재계산 성공 메시지
     */
    @PostMapping("/recommend/{projectId}/recalculate")
    public RsData<Void> recalculateRecommendations(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long projectId
    ) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // 프로젝트 소유자 확인
        if (user == null) {
            throw new ServiceException("401-1", "로그인이 필요합니다.");
        }
        if (!project.isOwner(user.getMember())) {
            throw new ServiceException("403-1", "프로젝트 소유자만 재계산을 요청할 수 있습니다.");
        }

        // 매칭 점수 재계산
        int calculatedCount = matchScoreService.calculateAndSaveRecommendations(projectId);

        return new RsData<>(
                "200-1",
                String.format("매칭 점수가 재계산되었습니다. (추천 프리랜서: %d명)", calculatedCount)
        );
    }
}
