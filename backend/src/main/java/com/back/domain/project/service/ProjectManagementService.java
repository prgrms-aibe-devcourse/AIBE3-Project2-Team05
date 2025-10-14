package com.back.domain.project.service;

import com.back.domain.project.dto.ProjectRequest;
import com.back.domain.project.dto.ProjectResponse;
import com.back.domain.project.entity.Project;
import com.back.domain.project.entity.enums.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 프로젝트 관리 퍼사드 서비스
 * 다양한 프로젝트 서비스들을 조합하여 복합적인 비즈니스 로직 제공
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectManagementService {

    private final ProjectService projectService;
    private final ProjectQueryService projectQueryService;
    private final ProjectTechService projectTechService;
    private final ProjectStatusService projectStatusService;

    // === 프로젝트 생성 관련 ===

    /**
     * 프로젝트 완전 생성
     */
    @Transactional
    public ProjectResponse createCompleteProject(ProjectRequest request) {
        return projectService.createCompleteProject(request);
    }

    // === 프로젝트 조회 관련 ===

    /**
     * 프로젝트 목록 조회
     */
    public Page<ProjectResponse> getAllProjects(int page, int size) {
        return projectQueryService.getAllProjects(page, size);
    }

    /**
     * 사용자별 프로젝트 목록 조회 (페이징 + 필터링)
     */
    public Page<ProjectResponse> getProjectsByManagerId(Long managerId, int page, int size, String search,
                                                        ProjectStatus status, ProjectField projectField,
                                                        RecruitmentType recruitmentType, PartnerType partnerType,
                                                        BudgetRange budgetType, Long minBudget, Long maxBudget,
                                                        String location, List<String> techNames, String sortBy) {
        return projectQueryService.getProjectsByManagerId(managerId, page, size, search, status, projectField,
                recruitmentType, partnerType, budgetType, minBudget, maxBudget, location, techNames, sortBy);
    }

    /**
     * 프로젝트 상세 조회 (기술스택 포함)
     */
    public ProjectResponse getProjectDetail(Long id) {
        return projectQueryService.getProjectDetail(id);
    }

    // === 프로젝트 수정 관련 ===

    /**
     * 프로젝트 추가 정보 업데이트
     */
    @Transactional
    public ProjectResponse completeProjectWithAdditionalInfo(Long projectId, ProjectRequest request) {
        return projectService.completeProjectWithAdditionalInfo(projectId, request);
    }

    // === 프로젝트 상태 관리 ===

    /**
     * 프로젝트 상태 변경
     */
    @Transactional
    public Project updateProjectStatus(Long projectId, ProjectStatus newStatus, Long changedById) {
        return projectStatusService.updateProjectStatus(projectId, newStatus, changedById);
    }

    // === 프로젝트 삭제 ===

    /**
     * 프로젝트 삭제
     */
    @Transactional
    public void deleteProject(Long id, Long requesterId) {
        projectService.deleteProject(id, requesterId);
    }
}
