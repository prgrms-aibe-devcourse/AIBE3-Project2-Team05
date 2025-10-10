package com.back.domain.project.project.service;

import com.back.domain.project.project.dto.ProjectRequest;
import com.back.domain.project.project.dto.ProjectResponse;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectTech;
import com.back.domain.project.project.entity.enums.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
     * 프로젝트 기본 생성
     */
    @Transactional
    public ProjectResponse createBasicProject(ProjectRequest request) {
        return projectService.createBasicProject(request);
    }

    /**
     * 프로젝트 완전 생성
     */
    @Transactional
    public ProjectResponse createCompleteProject(ProjectRequest request) {
        return projectService.createCompleteProject(request);
    }

    /**
     * 프로젝트 생성 (기존 방식 - 호환성 유지)
     */
    @Transactional
    public Project createProject(Project project) {
        return projectService.createProject(project);
    }

    // === 프로젝트 조회 관련 ===

    /**
     * 프로젝트 목록 조회
     */
    public Page<ProjectResponse> getAllProjects(int page, int size) {
        return projectQueryService.getAllProjects(page, size);
    }

    /**
     * 사용자별 프로젝트 목록 조회
     */
    public List<ProjectResponse> getProjectsByManagerId(Long managerId) {
        return projectQueryService.getProjectsByManagerId(managerId);
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
        return projectQueryService.searchProjects(keyword, status, projectField, recruitmentType,
                partnerType, budgetType, minBudget, maxBudget, location, techNames, sortBy, pageable);
    }

    // === 프로젝트 수정 관련 ===

    /**
     * 프로젝트 수정
     */
    @Transactional
    public Project updateProject(Long id, Project updateData) {
        return projectService.updateProject(id, updateData);
    }

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

    /**
     * 프로젝트 모집 시작
     */
    @Transactional
    public Project startRecruiting(Long projectId, Long managerId) {
        return projectStatusService.startRecruiting(projectId, managerId);
    }

    /**
     * 프로젝트 계약 시작
     */
    @Transactional
    public Project startContracting(Long projectId, Long managerId) {
        return projectStatusService.startContracting(projectId, managerId);
    }

    /**
     * 프로젝트 시작
     */
    @Transactional
    public Project startProject(Long projectId, Long managerId) {
        return projectStatusService.startProject(projectId, managerId);
    }

    /**
     * 프로젝트 완료
     */
    @Transactional
    public Project completeProject(Long projectId, Long managerId) {
        return projectStatusService.completeProject(projectId, managerId);
    }

    /**
     * 프로젝트 보류
     */
    @Transactional
    public Project suspendProject(Long projectId, Long managerId) {
        return projectStatusService.suspendProject(projectId, managerId);
    }

    /**
     * 프로젝트 취소
     */
    @Transactional
    public Project cancelProject(Long projectId, Long managerId) {
        return projectStatusService.cancelProject(projectId, managerId);
    }

    // === 기술 스택 관리 ===

    /**
     * 프로젝트 기술스택 조회
     */
    public List<ProjectTech> getProjectTechs(Long projectId) {
        return projectTechService.getProjectTechs(projectId);
    }

    /**
     * 프로젝트 기술스택 이름 목록 조회
     */
    public List<String> getProjectTechNames(Long projectId) {
        return projectTechService.getProjectTechNames(projectId);
    }

    /**
     * 기술스택 업데이트
     */
    @Transactional
    public List<String> updateProjectTechStacks(Long projectId, List<String> techNames) {
        return projectTechService.updateTechStacks(projectId, techNames);
    }

    /**
     * 기술스택 추가
     */
    @Transactional
    public void addProjectTechStack(Long projectId, String techName) {
        projectTechService.addTechStack(projectId, techName);
    }

    // === 프로젝트 삭제 ===

    /**
     * 프로젝트 삭제
     */
    @Transactional
    public void deleteProject(Long id, Long requesterId) {
        projectService.deleteProject(id, requesterId);
    }

    // === 편의 메서드들 ===

    /**
     * 프로젝트 상태 확인
     */
    public ProjectStatus getProjectStatus(Long projectId) {
        return projectStatusService.getProjectStatus(projectId);
    }

    /**
     * 프로젝트가 활성 상태인지 확인
     */
    public boolean isProjectActive(Long projectId) {
        return projectStatusService.isProjectActive(projectId);
    }

    /**
     * 프로젝트가 종료된 상태인지 확인
     */
    public boolean isProjectFinished(Long projectId) {
        return projectStatusService.isProjectFinished(projectId);
    }

    /**
     * 프로젝트 조회수 증가
     */
    @Transactional
    public void incrementViewCount(Long projectId) {
        projectQueryService.incrementViewCount(projectId);
    }
}
