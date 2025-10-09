package com.back.domain.project.project.service;

import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.enums.ProjectStatus;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.project.project.validator.ProjectValidator;
import com.back.global.exception.ProjectNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 프로젝트 상태 관리 전용 서비스
 * 단일 책임: 프로젝트 상태 변경 및 상태 관련 비즈니스 로직
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectStatusService {

    private final ProjectRepository projectRepository;
    private final ProjectStatusHistoryService statusHistoryService;
    private final ProjectValidator projectValidator;

    /**
     * 프로젝트 상태 변경
     */
    @Transactional
    public Project updateProjectStatus(Long projectId, ProjectStatus newStatus, Long changedById) {
        log.info("프로젝트 상태 변경 - projectId: {}, newStatus: {}, changedById: {}", projectId, newStatus, changedById);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        projectValidator.validateStatusChangePermission(project, changedById);

        ProjectStatus previousStatus = project.getStatus();
        projectValidator.validateStatusTransition(previousStatus, newStatus);

        project.setStatus(newStatus);
        project.setModifyDate(LocalDateTime.now());

        Project updatedProject = projectRepository.save(project);

        // 상태 변경 이력 저장
        statusHistoryService.createStatusHistory(projectId, previousStatus, newStatus, changedById);

        return updatedProject;
    }

    /**
     * 프로젝트를 모집중 상태로 변경
     */
    @Transactional
    public Project startRecruiting(Long projectId, Long managerId) {
        log.info("프로젝트 모집 시작 - projectId: {}, managerId: {}", projectId, managerId);
        return updateProjectStatus(projectId, ProjectStatus.RECRUITING, managerId);
    }

    /**
     * 프로젝트를 계약중 상태로 변경
     */
    @Transactional
    public Project startContracting(Long projectId, Long managerId) {
        log.info("프로젝트 계약 시작 - projectId: {}, managerId: {}", projectId, managerId);
        return updateProjectStatus(projectId, ProjectStatus.CONTRACTING, managerId);
    }

    /**
     * 프로젝트를 진행중 상태로 변경
     */
    @Transactional
    public Project startProject(Long projectId, Long managerId) {
        log.info("프로젝트 시작 - projectId: {}, managerId: {}", projectId, managerId);
        return updateProjectStatus(projectId, ProjectStatus.IN_PROGRESS, managerId);
    }

    /**
     * 프로젝트를 완료 상태로 변경
     */
    @Transactional
    public Project completeProject(Long projectId, Long managerId) {
        log.info("프로젝트 완료 - projectId: {}, managerId: {}", projectId, managerId);
        return updateProjectStatus(projectId, ProjectStatus.COMPLETED, managerId);
    }

    /**
     * 프로젝트를 보류 상태로 변경
     */
    @Transactional
    public Project suspendProject(Long projectId, Long managerId) {
        log.info("프로젝트 보류 - projectId: {}, managerId: {}", projectId, managerId);
        return updateProjectStatus(projectId, ProjectStatus.SUSPENDED, managerId);
    }

    /**
     * 프로젝트를 취소 상태로 변경
     */
    @Transactional
    public Project cancelProject(Long projectId, Long managerId) {
        log.info("프로젝트 취소 - projectId: {}, managerId: {}", projectId, managerId);
        return updateProjectStatus(projectId, ProjectStatus.CANCELLED, managerId);
    }

    /**
     * 프로젝트 상태 확인
     */
    public ProjectStatus getProjectStatus(Long projectId) {
        log.debug("프로젝트 상태 조회 - projectId: {}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        return project.getStatus();
    }

    /**
     * 프로젝트가 특정 상태인지 확인
     */
    public boolean isProjectInStatus(Long projectId, ProjectStatus status) {
        return getProjectStatus(projectId) == status;
    }

    /**
     * 프로젝트가 활성 상태인지 확인 (모집중, 계약중, 진행중)
     */
    public boolean isProjectActive(Long projectId) {
        ProjectStatus status = getProjectStatus(projectId);
        return status == ProjectStatus.RECRUITING ||
               status == ProjectStatus.CONTRACTING ||
               status == ProjectStatus.IN_PROGRESS;
    }

    /**
     * 프로젝트가 종료된 상태인지 확인 (완료, 보류, 취소)
     */
    public boolean isProjectFinished(Long projectId) {
        ProjectStatus status = getProjectStatus(projectId);
        return status == ProjectStatus.COMPLETED ||
               status == ProjectStatus.SUSPENDED ||
               status == ProjectStatus.CANCELLED;
    }
}
