package com.back.domain.project.project.service;

import com.back.domain.project.project.dto.ProjectRequest;
import com.back.domain.project.project.dto.ProjectResponse;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectFile;
import com.back.domain.project.project.entity.ProjectStatusHistory;
import com.back.domain.project.project.entity.ProjectTech;
import com.back.domain.project.project.entity.enums.*;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.project.project.repository.ProjectTechRepository;
import com.back.domain.project.project.validator.ProjectValidator;
import com.back.global.exception.ProjectAccessDeniedException;
import com.back.global.exception.ProjectNotFoundException;
import com.back.global.util.EntityDtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTechRepository projectTechRepository;
    private final ProjectStatusHistoryService statusHistoryService;
    private final ProjectFileService projectFileService;
    private final ProjectValidator projectValidator;

    /**
     * 프로젝트 목록 조회 (페이징) - 기술스택 제외
     */
    @Transactional(readOnly = true)
    public Page<ProjectResponse> getAllProjects(int page, int size) {
        log.debug("프로젝트 목록 조회 - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createDate"));

        // 기술스택 없이 프로젝트만 조회 (목록에서는 기술스택 표시 안함)
        Page<Project> projects = projectRepository.findAll(pageable);

        // 기술스택 없이 ProjectResponse로 변환
        return projects.map(project -> ProjectResponse.from(project, null));
    }

    /**
     * 사용자별 프로젝트 목록 조회 - 기술스택 제외
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByManagerId(Long managerId) {
        log.debug("사용자 프로젝트 목록 조회 - managerId: {}", managerId);

        // 기술스택 없이 프로젝트만 조회
        List<Project> projects = projectRepository.findByManagerIdOrderByCreateDateDesc(managerId);

        // 기술스택 없이 ProjectResponse로 변환
        return projects.stream()
                .map(project -> ProjectResponse.from(project, null))
                .collect(Collectors.toList());
    }

    /**
     * 프로젝트 기본 생성 (필수 입력사항만)
     */
    @Transactional
    public ProjectResponse createBasicProject(ProjectRequest request) {
        log.info("프로젝트 기본 생성 - title: {}, managerId: {}", request.title(), request.managerId());

        // DTO → Entity 변환 (매핑 유틸리티 사용)
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
            techNames = saveTechStacks(savedProject.getId(), request.techNames());
        }

        return ProjectResponse.from(savedProject, techNames);
    }

    /**
     * 프로젝트 완전 생성 (기본 정보 + 추가 정보)
     */
    @Transactional
    public ProjectResponse createCompleteProject(ProjectRequest request) {
        log.info("프로젝트 완전 생성 - title: {}, managerId: {}", request.title(), request.managerId());

        // DTO → Entity 변환 (매핑 유틸리티 사용)
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
            techNames = saveTechStacks(savedProject.getId(), request.techNames());
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

        // DTO → Entity 업데이트 적용 (매핑 유틸리티 사용)
        EntityDtoMapper.updateEntity(project, request);

        // 기술 스택 업데이트
        if (request.techNames() != null && !request.techNames().isEmpty()) {
            // 기존 기술스택 삭제 후 새로 추가
            projectTechRepository.deleteByProjectId(projectId);
            saveTechStacks(projectId, request.techNames());
        }

        // 파일 첨부
        if (request.attachmentFileIds() != null && !request.attachmentFileIds().isEmpty()) {
            projectFileService.attachFilesToProject(projectId, request.attachmentFileIds());
        }

        Project updatedProject = projectRepository.save(project);

        // 업데이트된 기술 스택 조회
        List<ProjectTech> existingTechs = getProjectTechs(projectId);
        List<String> techNames = existingTechs.stream()
                .map(ProjectTech::getTechName)
                .collect(Collectors.toList());

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
     * 프로젝트 상태 변경
     */
    @Transactional
    public Project updateProjectStatus(Long id, ProjectStatus newStatus, Long changedById) {
        log.info("프로젝트 상태 변경 - id: {}, newStatus: {}, changedById: {}", id, newStatus, changedById);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        projectValidator.validateStatusChangePermission(project, changedById);

        ProjectStatus previousStatus = project.getStatus();
        projectValidator.validateStatusTransition(previousStatus, newStatus);

        project.setStatus(newStatus);
        project.setModifyDate(LocalDateTime.now());

        Project updatedProject = projectRepository.save(project);

        statusHistoryService.createStatusHistory(id, previousStatus, newStatus, changedById);

        return updatedProject;
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
        projectTechRepository.deleteByProjectId(id);
        log.debug("프로젝트 기술스택 삭제 완료 - projectId: {}", id);

        // 프로젝트 삭제
        projectRepository.deleteById(id);
    }

    /**
     * 프로젝트 추가 정보 입력/수정
     */
    @Transactional
    public Project updateAdditionalInfo(Long id, Long managerId, PartnerType partnerType,
                                        String progressStatus, String companyLocation,
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
    public Project updateAdditionalInfo(Long id, Long managerId, PartnerType partnerType,
                                        String progressStatus, String companyLocation,
                                        String partnerEtcDescription, List<ProjectTech> projectTechs) {
        log.info("프로젝트 추가 정보 수정 - id: {}, managerId: {}, techCount: {}",
                id, managerId, projectTechs != null ? projectTechs.size() : 0);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        projectValidator.validateProjectOwnership(project, managerId);

        // 추가 정보 업데이트
        updateFieldIfNotNull(partnerType, project::setPartnerType);
        updateFieldIfNotNull(progressStatus, project::setProgressStatus);
        updateFieldIfNotNull(companyLocation, project::setCompanyLocation);
        updateFieldIfNotNull(partnerEtcDescription, project::setPartnerEtcDescription);

        // 기술스택 업데이트
        if (projectTechs != null) {
            // 기존 기술스택 삭제
            projectTechRepository.deleteByProjectId(id);
            log.debug("기존 프로젝트 기술스택 삭제 완료 - projectId: {}", id);

            // 새로운 기술스택 추가
            if (!projectTechs.isEmpty()) {
                projectTechs.forEach(tech -> {
                    tech.setProjectId(id);
                    tech.setCreateDate(LocalDateTime.now());
                });
                projectTechRepository.saveAll(projectTechs);
                log.debug("새로운 프로젝트 기술스택 추가 완료 - projectId: {}, count: {}", id, projectTechs.size());
            }
        }

        project.setModifyDate(LocalDateTime.now());

        return projectRepository.save(project);
    }

    /**
     * 프로젝트 검색 및 필터링 (통합)
     */
    @Transactional(readOnly = true)
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

        // 키워드가 없고 필터 조건도 없으면 전체 조회
        if (isEmptySearchCondition(keyword, status, projectField, recruitmentType, partnerType, budgetType, location, techNames)) {
            return projectRepository.findAll(sortedPageable);
        }

        return projectRepository.findProjectsWithFilters(
                status, projectField, recruitmentType, partnerType, budgetType,
                minBudget, maxBudget, location, keyword, techNames, sortedPageable);
    }

    /**
     * 기술 스택 저장 헬퍼 메서드
     */
    private List<String> saveTechStacks(Long projectId, List<String> techNames) {
        List<ProjectTech> projectTechs = techNames.stream()
                .map(techName -> ProjectTech.builder()
                        .projectId(projectId)
                        .techName(techName)
                        .createDate(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        projectTechRepository.saveAll(projectTechs);
        log.debug("프로젝트 기술스택 저장 완료 - projectId: {}, count: {}", projectId, projectTechs.size());

        return techNames;
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

    private Pageable createSortedPageable(Pageable pageable, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createDate"); // 기본 정렬

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

    /**
     * 프로젝트 기술스택 조회
     */
    @Transactional(readOnly = true)
    public List<ProjectTech> getProjectTechs(Long projectId) {
        log.debug("프로젝트 기술스택 조회 - projectId: {}", projectId);
        return projectTechRepository.findByProjectIdOrderByCreateDate(projectId);
    }

    /**
     * 프로젝트 상태 변경 이력 조회
     */
    @Transactional(readOnly = true)
    public List<ProjectStatusHistory> getProjectStatusHistory(Long projectId) {
        log.debug("프로젝트 상태 변경 이력 조회 - projectId: {}", projectId);
        return statusHistoryService.getProjectStatusHistory(projectId);
    }

    /**
     * 조회수 증가
     */
    @Transactional
    protected void incrementViewCount(Long projectId) {
        log.debug("조회수 증가 - projectId: {}", projectId);

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project != null) {
            project.setViewCount(project.getViewCount() + 1);
            projectRepository.save(project);
        }
    }

    /**
     * 프로젝트 상세 조회 (기술스택 + 상태변경이력 + 프로젝트 파일 포함)
     */
    @Transactional(readOnly = true)
    public Optional<ProjectResponse> getProjectDetailById(Long id) {
        log.debug("프로젝트 상세 조회 (통합) - id: {}", id);

        Optional<Project> projectOpt = projectRepository.findById(id);

        if (projectOpt.isEmpty()) {
            return Optional.empty();
        }

        Project project = projectOpt.get();

        // 조회수 증가 (별도 트랜잭션으로 처리)
        try {
            incrementViewCount(id);
        } catch (Exception e) {
            log.warn("조회수 증가 실패 - id: {}, error: {}", id, e.getMessage());
        }

        // 기술스택과 상태 이력, 프로젝트 파일을 함께 조회
        List<ProjectTech> techStacks = getProjectTechs(id);
        List<ProjectStatusHistory> statusHistories = getProjectStatusHistory(id);
        List<ProjectFile> projectFiles = projectFileService.getProjectFiles(id);

        return Optional.of(ProjectResponse.fromDetail(project, techStacks, projectFiles, statusHistories));
    }

    /**
     * 사용자 프로젝트 상세 조회 (기술스택 + 상태변경이력 + 프로젝트 파일 포함)
     */
    @Transactional(readOnly = true)
    public Optional<ProjectResponse> getProjectDetailByIdForManager(Long id, Long managerId) {
        log.debug("사용자 프로젝트 상세 조회 (통합) - id: {}, managerId: {}", id, managerId);

        Optional<Project> projectOpt = projectRepository.findById(id);

        if (projectOpt.isEmpty()) {
            return Optional.empty();
        }

        Project project = projectOpt.get();

        // 프로젝트 소유자 확인
        if (!project.getManagerId().equals(managerId)) {
            throw new ProjectAccessDeniedException();
        }

        // 조회수는 증가시키지 않음 (본인 프로젝트)
        List<ProjectTech> techStacks = getProjectTechs(id);
        List<ProjectStatusHistory> statusHistories = getProjectStatusHistory(id);
        List<ProjectFile> projectFiles = projectFileService.getProjectFiles(id);

        return Optional.of(ProjectResponse.fromDetail(project, techStacks, projectFiles, statusHistories));
    }

    /**
     * 프로젝트 통합 수정 (모든 정보를 한번에 수정)
     */
    @Transactional
    public ProjectResponse updateProjectComplete(Long id, ProjectRequest request) {
        log.info("프로젝트 통합 수정 - id: {}", id);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        // DTO → Entity 업데이트 적용 (매핑 유틸리티 사용)
        EntityDtoMapper.updateEntity(project, request);

        // 기술 스택 업데이트
        if (request.techNames() != null && !request.techNames().isEmpty()) {
            // 기존 기술스택 삭제 후 새로 추가
            projectTechRepository.deleteByProjectId(id);
            saveTechStacks(id, request.techNames());
        }

        // 파일 첨부
        if (request.attachmentFileIds() != null && !request.attachmentFileIds().isEmpty()) {
            projectFileService.attachFilesToProject(id, request.attachmentFileIds());
        }

        Project updatedProject = projectRepository.save(project);

        // 업데이트된 기술 스택 조회
        List<ProjectTech> existingTechs = getProjectTechs(id);
        List<String> techNames = existingTechs.stream()
                .map(ProjectTech::getTechName)
                .collect(Collectors.toList());

        return ProjectResponse.from(updatedProject, techNames);
    }
}
