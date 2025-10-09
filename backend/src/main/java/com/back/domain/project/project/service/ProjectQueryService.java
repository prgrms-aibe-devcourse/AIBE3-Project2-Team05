package com.back.domain.project.project.service;

import com.back.domain.project.project.dto.ProjectResponse;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectTech;
import com.back.domain.project.project.entity.enums.*;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.project.project.validator.ProjectValidator;
import com.back.global.exception.ProjectNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 프로젝트 조회 및 검색 전용 서비스
 * 단일 책임: 프로젝트 데이터 조회, 검색, 필터링
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectQueryService {

    private final ProjectRepository projectRepository;
    private final ProjectTechService projectTechService;
    private final ProjectValidator projectValidator;

    /**
     * 프로젝트 목록 조회 (페이징)
     */
    public Page<ProjectResponse> getAllProjects(int page, int size) {
        log.debug("프로젝트 목록 조회 - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createDate"));

        Page<Project> projects = projectRepository.findAll(pageable);
        return projects.map(project -> ProjectResponse.from(project, null));
    }

    /**
     * 사용자별 프로젝트 목록 조회
     */
    public List<ProjectResponse> getProjectsByManagerId(Long managerId) {
        log.debug("사용자 프로젝트 목록 조회 - managerId: {}", managerId);

        List<Project> projects = projectRepository.findByManagerIdOrderByCreateDateDesc(managerId);
        return projects.stream()
                .map(project -> ProjectResponse.from(project, null))
                .collect(Collectors.toList());
    }

    /**
     * 프로젝트 단건 조회 (상세정보)
     */
    public Optional<Project> getProjectById(Long id) {
        log.debug("프로젝트 단건 조회 - id: {}", id);
        return projectRepository.findById(id);
    }

    /**
     * 프로젝트 상세 조회 (기술스택 포함)
     */
    public ProjectResponse getProjectDetail(Long id) {
        log.debug("프로젝트 상세 조회 - id: {}", id);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        // 조회수 증가
        incrementViewCount(id);

        // 기술스택 조회
        List<ProjectTech> projectTechs = projectTechService.getProjectTechs(id);
        List<String> techNames = projectTechs.stream()
                .map(ProjectTech::getTechName)
                .collect(Collectors.toList());

        return ProjectResponse.from(project, techNames);
    }

    /**
     * 프로젝트 검색 및 필터링
     */
    public Page<Project> searchProjects(String keyword,
                                        ProjectStatus status,
                                        ProjectField projectField,
                                        RecruitmentType recruitmentType,
                                        PartnerType partnerType,
                                        BudgetRange budgetType,
                                        Long minBudget,
                                        Long maxBudget,
                                        String location,
                                        List<String> techNames,
                                        String sortBy,
                                        Pageable pageable) {
        log.debug("프로젝트 검색 및 필터링 - keyword: {}, status: {}", keyword, status);

        // 검색 조건 검증
        projectValidator.validateSearchKeyword(keyword);
        projectValidator.validateBudgetRange(minBudget, maxBudget);

        // 정렬 처리
        Pageable sortedPageable = createSortedPageable(pageable, sortBy);

        // 빈 검색 조건 확인
        if (isEmptySearchCondition(keyword, status, projectField, recruitmentType, partnerType, budgetType, location, techNames)) {
            return projectRepository.findAll(sortedPageable);
        }

        return projectRepository.findProjectsWithFilters(
                status, projectField, recruitmentType, partnerType, budgetType,
                minBudget, maxBudget, location, keyword, techNames, sortedPageable);
    }

    /**
     * 조회수 증가
     */
    @Transactional
    public void incrementViewCount(Long projectId) {
        log.debug("조회수 증가 - projectId: {}", projectId);

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project != null) {
            project.setViewCount(project.getViewCount() + 1);
            projectRepository.save(project);
        }
    }

    private Pageable createSortedPageable(Pageable pageable, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createDate");

        if ("popular".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "viewCount", "createDate");
        } else if ("recent".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "createDate");
        }

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }

    private boolean isEmptySearchCondition(String keyword, ProjectStatus status, ProjectField projectField,
                                           RecruitmentType recruitmentType, PartnerType partnerType,
                                           BudgetRange budgetType, String location, List<String> techNames) {
        return (keyword == null || keyword.trim().isEmpty()) &&
                status == null &&
                projectField == null &&
                recruitmentType == null &&
                partnerType == null &&
                budgetType == null &&
                (location == null || location.trim().isEmpty()) &&
                (techNames == null || techNames.isEmpty());
    }
}
