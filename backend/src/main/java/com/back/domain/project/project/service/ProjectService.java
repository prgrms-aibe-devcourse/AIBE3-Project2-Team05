package com.back.domain.project.project.service;

import com.back.domain.project.project.dto.*;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectFile;
import com.back.domain.project.project.entity.ProjectStatusHistory;
import com.back.domain.project.project.entity.ProjectTech;
import com.back.domain.project.project.entity.enums.*;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.project.project.repository.ProjectTechRepository;
import com.back.global.exception.ProjectAccessDeniedException;
import com.back.global.exception.ProjectNotFoundException;
import com.back.global.exception.ValidationException;
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

    /**
     * 프로젝트 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<Project> getAllProjects(int page, int size) {
        log.debug("프로젝트 목록 조회 - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createDate"));

        return projectRepository.findAll(pageable);
    }

    /**
     * 사용자별 프로젝트 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Project> getProjectsByManagerId(Long managerId) {
        log.debug("사용자 프로젝트 목록 조회 - managerId: {}", managerId);
        return projectRepository.findByManagerIdOrderByCreateDateDesc(managerId);
    }

    /**
     * 프로젝트 기본 생성 (필수 입력사항만)
     */
    @Transactional
    public ProjectResponse createBasicProject(ProjectRequest request) {
        log.info("프로젝트 기본 생성 - title: {}, managerId: {}", request.title(), request.managerId());

        // 기본 프로젝트 엔티티 생성
        Project project = Project.builder()
                .title(request.title())
                .description(request.description())
                .projectField(request.projectField())
                .recruitmentType(request.recruitmentType())
                .budgetType(request.budgetType())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .managerId(request.managerId())
                .status(ProjectStatus.RECRUITING)
                .viewCount(0)
                .createDate(LocalDateTime.now())
                .build();

        validateProject(project);

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

        // 완전한 프로젝트 엔티티 생성
        Project project = Project.builder()
                .title(request.title())
                .description(request.description())
                .projectField(request.projectField())
                .recruitmentType(request.recruitmentType())
                .budgetType(request.budgetType())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .managerId(request.managerId())
                .partnerType(request.partnerType())
                .budgetAmount(request.budgetAmount())
                .progressStatus(request.progressStatus())
                .companyLocation(request.companyLocation())
                .partnerEtcDescription(request.partnerEtcDescription())
                .status(ProjectStatus.RECRUITING)
                .viewCount(0)
                .createDate(LocalDateTime.now())
                .build();

        validateProject(project);

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

        // 추가 정보 업데이트
        updateFieldIfNotNull(request.partnerType(), project::setPartnerType);
        updateFieldIfNotNull(request.budgetAmount(), project::setBudgetAmount);
        updateFieldIfNotNull(request.progressStatus(), project::setProgressStatus);
        updateFieldIfNotNull(request.companyLocation(), project::setCompanyLocation);
        updateFieldIfNotNull(request.partnerEtcDescription(), project::setPartnerEtcDescription);

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

        project.setModifyDate(LocalDateTime.now());

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

        validateProject(project);

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

        validateProjectOwnership(project, updateData.getManagerId());
        validateProject(updateData);

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

        validateStatusChangePermission(project, changedById);

        ProjectStatus previousStatus = project.getStatus();
        validateStatusTransition(previousStatus, newStatus);

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

        validateProjectOwnership(project, requesterId);

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

        validateProjectOwnership(project, managerId);

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

        validateProjectOwnership(project, managerId);

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

    private void validateProject(Project project) {
        // Null 체크
        validateNotNull(project.getTitle(), "프로젝트 제목은 필수입니다.");
        validateNotNull(project.getDescription(), "프로젝트 설명은 필수입니다.");
        validateNotNull(project.getProjectField(), "프로젝트 분야는 필수입니다.");
        validateNotNull(project.getRecruitmentType(), "모집 형태는 필수입니다.");
        validateNotNull(project.getBudgetType(), "예산 유형은 필수입니다.");
        validateNotNull(project.getStartDate(), "시작일은 필수입니다.");
        validateNotNull(project.getEndDate(), "종료일은 필수입니다.");
        validateNotNull(project.getManagerId(), "프로젝트 관리자는 필수입니다.");

        // 길이 검증
        validateStringLength(project.getTitle(), 200, "프로젝트 제목은 200자를 초과할 수 없습니다.");
        validateStringLength(project.getDescription(), 5000, "프로젝트 설명은 5000자를 초과할 수 없습니다.");

        // 엔티티 자체 검증
        project.validateDates();
        project.validateBudget();
    }

    private void validateNotNull(Object value, String message) {
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(message);
        }
    }

    private void validateStringLength(String value, int maxLength, String message) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(message);
        }
    }

    private void validateProjectOwnership(Project project, Long requesterId) {
        if (!project.getManagerId().equals(requesterId)) {
            throw new ProjectAccessDeniedException();
        }
    }

    private void validateStatusChangePermission(Project project, Long requesterId) {
        if (!project.getManagerId().equals(requesterId)) {
            throw new ProjectAccessDeniedException();
        }
    }

    private void validateStatusTransition(ProjectStatus from, ProjectStatus to) {
        if (from == ProjectStatus.COMPLETED && to == ProjectStatus.RECRUITING) {
            throw new ValidationException("완료된 프로젝트는 모집중으로 변경할 수 없습니다.", "INVALID_STATUS_TRANSITION");
        }

        if (from == ProjectStatus.CANCELLED && to == ProjectStatus.IN_PROGRESS) {
            throw new ValidationException("중단된 프로젝트는 진행중으로 직접 변경할 수 없습니다.", "INVALID_STATUS_TRANSITION");
        }
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

        // 기본 정보 업데이트
        updateFieldIfNotNull(request.title(), project::setTitle);
        updateFieldIfNotNull(request.description(), project::setDescription);
        updateFieldIfNotNull(request.projectField(), project::setProjectField);
        updateFieldIfNotNull(request.recruitmentType(), project::setRecruitmentType);
        updateFieldIfNotNull(request.budgetType(), project::setBudgetType);
        updateFieldIfNotNull(request.startDate(), project::setStartDate);
        updateFieldIfNotNull(request.endDate(), project::setEndDate);

        // 추가 정보 업데이트
        updateFieldIfNotNull(request.partnerType(), project::setPartnerType);
        updateFieldIfNotNull(request.budgetAmount(), project::setBudgetAmount);
        updateFieldIfNotNull(request.progressStatus(), project::setProgressStatus);
        updateFieldIfNotNull(request.companyLocation(), project::setCompanyLocation);
        updateFieldIfNotNull(request.partnerEtcDescription(), project::setPartnerEtcDescription);

        project.setModifyDate(LocalDateTime.now());

        validateProject(project);
        Project updatedProject = projectRepository.save(project);

        // 기술 스택 업데이트
        if (request.techNames() != null) {
            // 기존 기술스택 삭제
            projectTechRepository.deleteByProjectId(id);

            if (!request.techNames().isEmpty()) {
                saveTechStacks(id, request.techNames());
            }
        }

        // 파일 처리 (삭제할 파일들)
        if (request.filesToDelete() != null && !request.filesToDelete().isEmpty()) {
            projectFileService.deleteFiles(request.filesToDelete());
        }

        // 새로운 파일들 연결
        if (request.attachmentFileIds() != null && !request.attachmentFileIds().isEmpty()) {
            projectFileService.attachFilesToProject(id, request.attachmentFileIds());
        }

        // 상세 정보 조회해서 반환
        return getProjectDetailById(id).orElseThrow(() ->
                new IllegalStateException("수정된 프로젝트 정보를 조회할 수 없습니다."));
    }
}
