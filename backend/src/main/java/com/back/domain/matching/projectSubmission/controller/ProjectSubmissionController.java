package com.back.domain.matching.projectSubmission.controller;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.matching.projectSubmission.dto.ProjectSubmissionCreateReqBody;
import com.back.domain.matching.projectSubmission.dto.ProjectSubmissionDto;
import com.back.domain.matching.projectSubmission.dto.ProjectSubmissionModifyReqBody;
import com.back.domain.matching.projectSubmission.dto.ProjectSubmissionStatusUpdateReqBody;
import com.back.domain.matching.projectSubmission.entity.ProjectSubmission;
import com.back.domain.matching.projectSubmission.service.ProjectSubmissionService;
import com.back.domain.project.entity.Project;
import com.back.domain.project.repository.ProjectRepository;
import com.back.domain.project.service.ProjectService;
import com.back.global.exception.ServiceException;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 프로젝트 지원 API Controller
 */
@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class ProjectSubmissionController {

    private final ProjectSubmissionService projectSubmissionService;
    private final ProjectService projectService;
    private final ProjectRepository projectRepository;
    private final FreelancerRepository freelancerRepository;
    private final ObjectMapper objectMapper;

    /**
     * 프로젝트 지원 생성
     *
     * @param user    현재 로그인한 사용자 (프리랜서)
     * @param reqBody 지원 정보
     * @return 생성된 지원 정보
     */
    @PostMapping
    @Transactional
    public RsData<ProjectSubmissionDto> create(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody ProjectSubmissionCreateReqBody reqBody
    ) {
        // FreelancerRepository로 Freelancer 조회
        Freelancer freelancer = freelancerRepository.findByMemberId(user.getId())
                .orElseThrow(() -> new ServiceException("403-1", "프리랜서 권한이 필요합니다."));

        // Portfolio 데이터를 JSON 문자열로 변환
        String portfolioData = null;
        try {
            if (reqBody.portfolio() != null && !reqBody.portfolio().isEmpty()) {
                portfolioData = objectMapper.writeValueAsString(reqBody.portfolio());
            }
        } catch (Exception e) {
            // JSON 변환 실패 시 빈 배열로 처리
            portfolioData = "[]";
        }

        ProjectSubmission submission = projectSubmissionService.create(
                freelancer,
                reqBody.projectId(),
                reqBody.coverLetter(),
                reqBody.proposedRate(),
                reqBody.estimatedDuration(),
                portfolioData
        );

        return new RsData<>(
                "201-1",
                "프로젝트 지원이 완료되었습니다.",
                new ProjectSubmissionDto(submission)
        );
    }

    /**
     * 지원 목록 조회
     * - 프리랜서: 내가 지원한 프로젝트 목록
     * - PM: 내 프로젝트에 지원한 프리랜서 목록 (projectId 필수)
     *
     * @param user      현재 로그인한 사용자
     * @param projectId 프로젝트 ID (PM인 경우 필수)
     * @return 지원 목록
     */
    @GetMapping
    public RsData<List<ProjectSubmissionDto>> getSubmissions(
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam(required = false) Long projectId
    ) {
        List<ProjectSubmission> submissions;

        // TODO: 프리랜서/PM 구분 로직 구현 필요
        if (projectId != null) {
            // PM이 프로젝트의 지원자 목록 조회
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

            // 프로젝트 소유자 확인
            // TODO: project.getManager().getId()와 user.getId() 비교 로직 구현 필요

            submissions = projectSubmissionService.findActiveSubmissionsByProject(projectId);
        } else {
            // 프리랜서가 자신의 지원 목록 조회
            Freelancer freelancer = freelancerRepository.findByMemberId(user.getId())
                    .orElseThrow(() -> new ServiceException("403-1", "프리랜서 권한이 필요합니다."));
            submissions = projectSubmissionService.findActiveSubmissionsByFreelancer(freelancer);
        }

        List<ProjectSubmissionDto> dtos = submissions.stream()
                .map(ProjectSubmissionDto::new)
                .toList();

        return new RsData<>(
                "200-1",
                "지원 목록이 조회되었습니다.",
                dtos
        );
    }

    /**
     * 지원 상세 조회
     *
     * @param user 현재 로그인한 사용자
     * @param id   지원 ID
     * @return 지원 상세 정보
     */
    @GetMapping("/{id}")
    public RsData<ProjectSubmissionDto> getSubmission(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id
    ) {
        ProjectSubmission submission = projectSubmissionService.findById(id);

        // TODO: 권한 확인 (프리랜서 본인 또는 프로젝트 PM)

        return new RsData<>(
                "200-1",
                "지원 정보가 조회되었습니다.",
                new ProjectSubmissionDto(submission)
        );
    }

    /**
     * 지원서 수정 (프리랜서 전용, PENDING 상태에서만 가능)
     *
     * @param user    현재 로그인한 사용자 (프리랜서)
     * @param id      지원 ID
     * @param reqBody 수정할 정보
     * @return 성공 메시지
     */
    @PutMapping("/{id}")
    @Transactional
    public RsData<Void> modify(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id,
            @Valid @RequestBody ProjectSubmissionModifyReqBody reqBody
    ) {
        Freelancer freelancer = freelancerRepository.findByMemberId(user.getId())
                .orElseThrow(() -> new ServiceException("403-1", "프리랜서 권한이 필요합니다."));
        ProjectSubmission submission = projectSubmissionService.findById(id);

        // Portfolio 데이터를 JSON 문자열로 변환
        String portfolioData = null;
        try {
            if (reqBody.portfolio() != null && !reqBody.portfolio().isEmpty()) {
                portfolioData = objectMapper.writeValueAsString(reqBody.portfolio());
            }
        } catch (Exception e) {
            portfolioData = "[]";
        }

        projectSubmissionService.modify(
                submission,
                freelancer,
                reqBody.coverLetter(),
                reqBody.proposedRate(),
                reqBody.estimatedDuration(),
                portfolioData
        );

        return new RsData<>(
                "200-1",
                "지원서가 수정되었습니다."
        );
    }

    /**
     * 지원 취소 (프리랜서 전용)
     *
     * @param user 현재 로그인한 사용자 (프리랜서)
     * @param id   지원 ID
     * @return 성공 메시지
     */
    @DeleteMapping("/{id}")
    @Transactional
    public RsData<Void> cancel(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id
    ) {
        Freelancer freelancer = freelancerRepository.findByMemberId(user.getId())
                .orElseThrow(() -> new ServiceException("403-1", "프리랜서 권한이 필요합니다."));
        ProjectSubmission submission = projectSubmissionService.findById(id);

        projectSubmissionService.cancel(submission, freelancer);

        return new RsData<>(
                "200-1",
                "지원이 취소되었습니다."
        );
    }

    /**
     * 지원 상태 변경 (PM 전용)
     *
     * @param user    현재 로그인한 사용자 (PM)
     * @param id      지원 ID
     * @param reqBody 변경할 상태 정보
     * @return 성공 메시지
     */
    @PutMapping("/{id}/status")
    @Transactional
    public RsData<Void> updateStatus(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id,
            @Valid @RequestBody ProjectSubmissionStatusUpdateReqBody reqBody
    ) {
        ProjectSubmission submission = projectSubmissionService.findById(id);

        // TODO: PM 권한 확인 (프로젝트 소유자인지 확인)

        projectSubmissionService.updateStatus(submission, reqBody.status());

        return new RsData<>(
                "200-1",
                "지원 상태가 변경되었습니다."
        );
    }
}
