package com.back.domain.matching.matchScore.controller;

import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.repository.FreelancerTechRepository;
import com.back.domain.freelancer.portfolio.repository.PortfolioRepository;
import com.back.domain.matching.matchScore.dto.FreelancerRecommendationDto;
import com.back.domain.matching.matchScore.dto.RecommendationResponseDto;
import com.back.domain.matching.matchScore.entity.MatchScore;
import com.back.domain.matching.matchScore.repository.MatchScoreRepository;
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
    private final MatchScoreRepository matchScoreRepository;
    private final ProjectRepository projectRepository;
    private final FreelancerRepository freelancerRepository;
    private final FreelancerTechRepository freelancerTechRepository;
    private final PortfolioRepository portfolioRepository;

    /**
     * 프리랜서 추천 조회
     * 특정 프로젝트에 적합한 프리랜서 목록을 규칙 기반 매칭 알고리즘으로 추천합니다.
     *
     * 매칭 점수 구성 (100점 만점):
     * - 스킬 매칭: 50점 (요구 기술 보유 여부 및 숙련도)
     * - 경력: 30점 (총 경력 연수, 완료 프로젝트 수, 평균 평점)
     * - 단가: 20점 (프로젝트 예산과 희망 단가 일치도)
     *
     * @param user      현재 로그인한 사용자
     * @param projectId 프로젝트 ID
     * @param limit     추천 결과 개수 (기본값: 10, PM만 해당)
     * @param minScore  최소 매칭 점수 (기본값: 60)
     * @return 추천 프리랜서 목록 (프리랜서는 본인 매칭 정보만 조회)
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

        List<MatchScore> matchScores;

        // 프리랜서인 경우: 본인의 매칭 점수만 조회 (minScore 무시)
        if (user != null) {
            var freelancerOpt = freelancerRepository.findByMember(user.getMember());

            if (freelancerOpt.isPresent()) {
                // 프리랜서로 로그인한 경우, 본인의 매칭 점수만 조회
                var myScoreOpt = matchScoreRepository.findByProjectAndFreelancer(project, freelancerOpt.get());

                // 매칭 점수가 없으면 계산해서 생성
                if (myScoreOpt.isEmpty()) {
                    matchScoreService.calculateAndSaveForFreelancer(projectId, freelancerOpt.get().getId());
                    myScoreOpt = matchScoreRepository.findByProjectAndFreelancer(project, freelancerOpt.get());

                    if (myScoreOpt.isEmpty()) {
                        throw new ServiceException("500-1", "매칭 점수 계산에 실패했습니다.");
                    }
                }

                matchScores = List.of(myScoreOpt.get());
            } else {
                // PM 또는 일반 사용자: 전체 추천 목록 조회
                matchScores = matchScoreService.getRecommendations(projectId, limit, minScore);

                // 매칭 점수가 없으면 계산 후 다시 조회
                if (matchScores.isEmpty()) {
                    int calculatedCount = matchScoreService.calculateAndSaveRecommendations(projectId);

                    if (calculatedCount == 0) {
                        throw new ServiceException("404-1", "추천할 프리랜서가 없습니다. 프로젝트 요구 기술을 확인해주세요.");
                    }

                    matchScores = matchScoreService.getRecommendations(projectId, limit, minScore);
                }
            }
        } else {
            // 비로그인 사용자: 전체 추천 목록 조회
            matchScores = matchScoreService.getRecommendations(projectId, limit, minScore);

            // 매칭 점수가 없으면 계산 후 다시 조회
            if (matchScores.isEmpty()) {
                int calculatedCount = matchScoreService.calculateAndSaveRecommendations(projectId);

                if (calculatedCount == 0) {
                    throw new ServiceException("404-1", "추천할 프리랜서가 없습니다. 프로젝트 요구 기술을 확인해주세요.");
                }

                matchScores = matchScoreService.getRecommendations(projectId, limit, minScore);
            }
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
     * PM: 프로젝트의 전체 매칭 점수 재계산
     * 프리랜서: 본인의 매칭 점수만 재계산
     *
     * @param user      현재 로그인한 사용자
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

        if (user == null) {
            throw new ServiceException("401-1", "로그인이 필요합니다.");
        }

        // PM인 경우: 전체 재계산
        if (project.isOwner(user.getMember())) {
            int calculatedCount = matchScoreService.calculateAndSaveRecommendations(projectId);
            return new RsData<>(
                    "200-1",
                    String.format("매칭 점수가 재계산되었습니다. (추천 프리랜서: %d명)", calculatedCount)
            );
        }

        // 프리랜서인 경우: 본인 것만 재계산
        var freelancerOpt = freelancerRepository.findByMember(user.getMember());

        if (freelancerOpt.isEmpty()) {
            throw new ServiceException("403-1", "프로젝트 소유자 또는 프리랜서만 재계산을 요청할 수 있습니다.");
        }

        matchScoreService.calculateAndSaveForFreelancer(projectId, freelancerOpt.get().getId());

        return new RsData<>(
                "200-1",
                "내 매칭 점수가 업데이트되었습니다."
        );
    }
}
