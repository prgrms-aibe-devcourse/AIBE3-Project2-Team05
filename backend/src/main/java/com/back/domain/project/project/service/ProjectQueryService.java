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
     * 프로젝트 목록 조회 (페이징) - 통합된 검색/필터링 포함
     */
    public Page<ProjectResponse> getAllProjects(int page, int size, String keyword,
                                                ProjectStatus status, ProjectField projectField,
                                                RecruitmentType recruitmentType, PartnerType partnerType,
                                                BudgetRange budgetType, Long minBudget, Long maxBudget,
                                                String location, List<String> techNames, String sortBy) {
        log.debug("프로젝트 목록 조회 - page: {}, size: {}, keyword: {}, status: {}", page, size, keyword, status);

        Pageable pageable = PageRequest.of(page, size);

        // 필터링 조건이 있으면 검색, 없으면 전체 조회
        if (hasFilterConditions(keyword, status, projectField, recruitmentType, partnerType, budgetType, location, techNames)) {
            Page<Project> projects = searchProjects(keyword, status, projectField, recruitmentType, partnerType,
                    budgetType, minBudget, maxBudget, location, techNames, sortBy, pageable);
            return projects.map(project -> ProjectResponse.from(project, null));
        } else {
            Pageable sortedPageable = createSortedPageable(pageable, sortBy);
            Page<Project> projects = projectRepository.findAll(sortedPageable);
            return projects.map(project -> ProjectResponse.from(project, null));
        }
    }

    /**
     * 프로젝트 목록 조회 (페이징) - 기존 메서드 (호환성 유지)
     */
    public Page<ProjectResponse> getAllProjects(int page, int size) {
        return getAllProjects(page, size, null, null, null, null, null, null, null, null, null, null, "recent");
    }

    /**
     * 사용자별 프로젝트 목록 조회
     */
    public List<ProjectResponse> getProjectsByManagerId(Long managerId) {
        log.debug("사용자 프로젝트 목록 조회 - managerId: {}", managerId);

        List<Project> projects = projectRepository.findByManagerIdOrderByCreateDateDesc(managerId);
        return projects.stream()
                .map(project -> {
                    // 각 프로젝트의 기술스택도 함께 조회
                    List<String> techNames = projectTechService.getProjectTechNames(project.getId());
                    return ProjectResponse.from(project, techNames);
                })
                .collect(Collectors.toList());
    }

    /**
     * 사용자별 프로젝트 목록 조회 (페이징 + 필터링)
     */
    public Page<ProjectResponse> getProjectsByManagerId(Long managerId, int page, int size, String keyword,
                                                       ProjectStatus status, ProjectField projectField,
                                                       RecruitmentType recruitmentType, PartnerType partnerType,
                                                       BudgetRange budgetType, Long minBudget, Long maxBudget,
                                                       String location, List<String> techNames, String sortBy) {
        log.debug("사용자 프로젝트 목록 조회 (페이징+필터링) - managerId: {}, page: {}, size: {}, keyword: {}, status: {}",
                managerId, page, size, keyword, status);

        // 검색 조건 검증
        projectValidator.validateSearchKeyword(keyword);
        projectValidator.validateBudgetRange(minBudget, maxBudget);

        // 정렬 처리
        Pageable pageable = PageRequest.of(page, size);
        Pageable sortedPageable = createSortedPageable(pageable, sortBy);

        // 필터링 조건이 있으면 필터링 쿼리 사용, 없으면 기본 조회
        Page<Project> projects;
        if (hasFilterConditions(keyword, status, projectField, recruitmentType, partnerType, budgetType, location, techNames)) {
            projects = projectRepository.findProjectsByManagerIdWithFilters(
                    managerId, status, projectField, recruitmentType, partnerType,
                    budgetType, minBudget, maxBudget, location, keyword, techNames, sortedPageable);
        } else {
            // 필터링 조건이 없으면 managerId만으로 조회하는 간단한 쿼리 필요
            projects = projectRepository.findProjectsByManagerIdWithFilters(
                    managerId, null, null, null, null,
                    null, null, null, null, null, null, sortedPageable);
        }

        return projects.map(project -> {
            // 각 프로젝트의 기술스택도 함께 조회
            List<String> projectTechNames = projectTechService.getProjectTechNames(project.getId());
            return ProjectResponse.from(project, projectTechNames);
        });
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

        // 항상 필터링 쿼리 실행 (null 값들은 쿼리에서 자동으로 처리됨)
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

    /**
     * 필터링 조건 존재 여부 확인
     */
    private boolean hasFilterConditions(String keyword, ProjectStatus status, ProjectField projectField,
                                      RecruitmentType recruitmentType, PartnerType partnerType,
                                      BudgetRange budgetType, String location, List<String> techNames) {
        return (keyword != null && !keyword.trim().isEmpty()) ||
               status != null ||
               projectField != null ||
               recruitmentType != null ||
               partnerType != null ||
               budgetType != null ||
               (location != null && !location.trim().isEmpty()) ||
               (techNames != null && !techNames.isEmpty());
    }
}
