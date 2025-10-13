package com.back.domain.project.project.controller;

import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.project.project.dto.ProjectListDto;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 프로젝트 API Controller
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ApiV1ProjectController {

    private final ProjectRepository projectRepository;
    private final FreelancerRepository freelancerRepository;

    /**
     * 프로젝트 목록 조회
     * - 프리랜서: 모든 프로젝트 조회 (지원 가능한 프로젝트 탐색)
     * - PM: 본인이 생성한 프로젝트만 조회 (프로젝트 관리)
     * - 비로그인: 모든 프로젝트 조회 (공개 목록)
     */
    @GetMapping
    public RsData<List<ProjectListDto>> getProjects(
            @AuthenticationPrincipal SecurityUser user
    ) {
        List<Project> projects;

        // 로그인하지 않은 경우 또는 프리랜서인 경우: 모든 프로젝트 조회
        if (user == null || freelancerRepository.existsByMember(user.getMember())) {
            projects = projectRepository.findAllByOrderByCreateDateDesc();
        }
        // PM인 경우: 본인의 프로젝트만 조회
        else {
            projects = projectRepository.findByPmOrderByCreateDateDesc(user.getMember());
        }

        List<ProjectListDto> projectDtos = projects.stream()
                .map(ProjectListDto::new)
                .collect(Collectors.toList());

        return new RsData<>(
                "200-1",
                "프로젝트 목록 조회 성공",
                projectDtos
        );
    }
}
