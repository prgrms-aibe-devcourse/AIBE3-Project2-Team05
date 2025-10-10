package com.back.domain.project.project.service;

import com.back.domain.project.project.dto.ProjectRequest;
import com.back.domain.project.project.dto.ProjectResponse;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.enums.*;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.project.project.validator.ProjectValidator;
import com.back.global.exception.ProjectNotFoundException;
import com.back.global.util.EntityDtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 프로젝트 핵심 CRUD 서비스
 * 단일 책임: 프로젝트 생성, 수정, 삭제
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTechService projectTechService;
    private final ProjectStatusHistoryService statusHistoryService;
    private final ProjectFileService projectFileService;
    private final ProjectValidator projectValidator;

    /**
     * 프로젝트 기본 생성 (필수 입력사항만)
     */
    @Transactional
    public ProjectResponse createBasicProject(ProjectRequest request) {
        log.info("프로젝트 기본 생성 - title: {}, managerId: {}", request.title(), request.managerId());

        Project project = EntityDtoMapper.toEntity(request);
        project.setStatus(ProjectStatus.RECRUITING);
        project.setViewCount(0);

        projectValidator.validateProject(project);

        Project savedProject = projectRepository.save(project);

        // 상태 이력 생성
        statusHistoryService.createStatusHistory(
                savedProject.getId(), null, ProjectStatus.RECRUITING, savedProject.getManagerId());

        // 기술 스택 저장 (있는 경우)
        List<String> techNames = null;
        if (request.techNames() != null && !request.techNames().isEmpty()) {
            techNames = projectTechService.saveTechStacks(savedProject.getId(), request.techNames());
        }

        return ProjectResponse.from(savedProject, techNames);
    }

    /**
     * 프로젝트 완전 생성 (기본 정보 + 추가 정보)
     */
    @Transactional
    public ProjectResponse createCompleteProject(ProjectRequest request) {
        log.info("프로젝트 완전 생성 - title: {}, managerId: {}", request.title(), request.managerId());

        Project project = EntityDtoMapper.toEntity(request);
        project.setStatus(ProjectStatus.RECRUITING);
        project.setViewCount(0);

        projectValidator.validateProject(project);

        Project savedProject = projectRepository.save(project);

        // 상태 이력 생성
        statusHistoryService.createStatusHistory(
                savedProject.getId(), null, ProjectStatus.RECRUITING, savedProject.getManagerId());

        // 기술 스택 저장 (있는 경우)
        List<String> techNames = null;
        if (request.techNames() != null && !request.techNames().isEmpty()) {
            techNames = projectTechService.saveTechStacks(savedProject.getId(), request.techNames());
        }

        return ProjectResponse.from(savedProject, techNames);
    }

    /**
     * 기존 프로젝트에 추가 정보 업데이트
     */
    @Transactional
    public ProjectResponse completeProjectWithAdditionalInfo(Long projectId, ProjectRequest request) {
        log.info("프로젝트 추가 정보로 완성 - id: {}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        EntityDtoMapper.updateEntity(project, request);

        // 기술 스택 업데이트
        if (request.techNames() != null && !request.techNames().isEmpty()) {
            projectTechService.updateTechStacks(projectId, request.techNames());
        }

        // 파일 첨부
        if (request.attachmentFileIds() != null && !request.attachmentFileIds().isEmpty()) {
            projectFileService.attachFilesToProject(projectId, request.attachmentFileIds());
        }

        Project updatedProject = projectRepository.save(project);

        // 업데이트된 기술 스택 조회
        List<String> techNames = projectTechService.getProjectTechNames(projectId);

        return ProjectResponse.from(updatedProject, techNames);
    }

    /**
     * 프로젝트 생성 (기존 방식 - 호환성 유지)
     */
    @Transactional
    public Project createProject(Project project) {
        log.info("프로젝트 생성 - title: {}, managerId: {}",
                project.getTitle(), project.getManagerId());

        projectValidator.validateProject(project);

        project.setStatus(ProjectStatus.RECRUITING);
        project.setViewCount(0);
        project.setCreateDate(LocalDateTime.now());
        project.setModifyDate(LocalDateTime.now());

        Project savedProject = projectRepository.save(project);

        statusHistoryService.createStatusHistory(
                savedProject.getId(), null, ProjectStatus.RECRUITING, savedProject.getManagerId());

        return savedProject;
    }

    /**
     * 프로젝트 수정
     */
    @Transactional
    public Project updateProject(Long id, Project updateData) {
        log.info("프로젝트 수정 - id: {}", id);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        projectValidator.validateProjectOwnership(project, updateData.getManagerId());
        projectValidator.validateProject(updateData);

        updateProjectFields(project, updateData);
        project.setModifyDate(LocalDateTime.now());

        return projectRepository.save(project);
    }

    /**
     * 프로젝트 삭제
     */
    @Transactional
    public void deleteProject(Long id, Long requesterId) {
        log.info("프로젝트 삭제 - id: {}, requesterId: {}", id, requesterId);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        projectValidator.validateProjectOwnership(project, requesterId);

        // 관련 기술스택 먼저 삭제
        projectTechService.deleteTechStacks(id);

        // 프로젝트 삭제
        projectRepository.deleteById(id);
    }

    /**
     * 프로젝트 추가 정보 입력/수정
     */
    @Transactional
    public Project updateAdditionalInfo(Long id, Long managerId, PartnerType partnerType,
                                        ProgressStatus progressStatus, Region companyLocation,
                                        String partnerEtcDescription) {
        log.info("프로젝트 추가 정보 수정 - id: {}, managerId: {}", id, managerId);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        projectValidator.validateProjectOwnership(project, managerId);

        // 추가 정보 업데이트
        updateFieldIfNotNull(partnerType, project::setPartnerType);
        updateFieldIfNotNull(progressStatus, project::setProgressStatus);
        updateFieldIfNotNull(companyLocation, project::setCompanyLocation);
        updateFieldIfNotNull(partnerEtcDescription, project::setPartnerEtcDescription);

        project.setModifyDate(LocalDateTime.now());

        return projectRepository.save(project);
    }

    /**
     * 프로젝트 추가 정보 입력/수정 (기술스택 포함)
     */
    @Transactional
    public Project updateAdditionalInfoWithTech(Long id, Long managerId, PartnerType partnerType,
                                                ProgressStatus progressStatus, Region companyLocation,
                                                String partnerEtcDescription, List<String> techNames) {
        log.info("프로젝트 추가 정보 수정 (기술스택 포함) - id: {}, managerId: {}, techCount: {}",
                id, managerId, techNames != null ? techNames.size() : 0);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        projectValidator.validateProjectOwnership(project, managerId);

        // 추가 정보 업데이트
        updateFieldIfNotNull(partnerType, project::setPartnerType);
        updateFieldIfNotNull(progressStatus, project::setProgressStatus);
        updateFieldIfNotNull(companyLocation, project::setCompanyLocation);
        updateFieldIfNotNull(partnerEtcDescription, project::setPartnerEtcDescription);

        // 기술스택 업데이트
        if (techNames != null) {
            projectTechService.updateTechStacks(id, techNames);
        }

        project.setModifyDate(LocalDateTime.now());

        return projectRepository.save(project);
    }

    private void updateProjectFields(Project project, Project updateData) {
        updateFieldIfNotNull(updateData.getTitle(), project::setTitle);
        updateFieldIfNotNull(updateData.getDescription(), project::setDescription);
        updateFieldIfNotNull(updateData.getProjectField(), project::setProjectField);
        updateFieldIfNotNull(updateData.getRecruitmentType(), project::setRecruitmentType);
        updateFieldIfNotNull(updateData.getPartnerType(), project::setPartnerType);
        updateFieldIfNotNull(updateData.getBudgetType(), project::setBudgetType);
        updateFieldIfNotNull(updateData.getBudgetAmount(), project::setBudgetAmount);
        updateFieldIfNotNull(updateData.getStartDate(), project::setStartDate);
        updateFieldIfNotNull(updateData.getEndDate(), project::setEndDate);
        updateFieldIfNotNull(updateData.getProgressStatus(), project::setProgressStatus);
        updateFieldIfNotNull(updateData.getCompanyLocation(), project::setCompanyLocation);
        updateFieldIfNotNull(updateData.getPartnerEtcDescription(), project::setPartnerEtcDescription);
    }

    private <T> void updateFieldIfNotNull(T value, java.util.function.Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }
}
