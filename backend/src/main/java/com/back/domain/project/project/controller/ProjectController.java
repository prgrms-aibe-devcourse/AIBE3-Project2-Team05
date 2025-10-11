package com.back.domain.project.project.controller;

import com.back.domain.project.project.dto.ApiResponse;
import com.back.domain.project.project.dto.ProjectRequest;
import com.back.domain.project.project.dto.ProjectResponse;
import com.back.domain.project.project.dto.ProjectStatusChangeRequest;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.enums.*;
import com.back.domain.project.project.service.ProjectManagementService;
import com.back.domain.project.project.service.ProjectQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectManagementService projectManagementService;
    private final ProjectQueryService projectQueryService;

    // ===== 조회 API =====

    /**
     * 프로젝트 목록 조회 (페이징 + 필터링)
     */
    @GetMapping
    public ResponseEntity<Page<ProjectResponse>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) ProjectField projectField,
            @RequestParam(required = false) RecruitmentType recruitmentType,
            @RequestParam(required = false) PartnerType partnerType,
            @RequestParam(required = false) BudgetRange budgetType,
            @RequestParam(required = false) Long minBudget,
            @RequestParam(required = false) Long maxBudget,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> techNames,
            @RequestParam(defaultValue = "recent") String sortBy) {

        log.info("프로젝트 목록 조회 요청 - page: {}, size: {}, search: {}, status: {}, projectField: {}",
                page, size, search, status, projectField);

        try {
            Page<ProjectResponse> projects = projectQueryService.getAllProjects(
                    page, size, search, status, projectField, recruitmentType, partnerType,
                    budgetType, minBudget, maxBudget, location, techNames, sortBy);

            log.info("필터링 결과: {} 건의 프로젝트 반환", projects.getTotalElements());
            return ResponseEntity.ok(projects);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 목록 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 프로젝트 상세 조회 (기술스택 + 상태변경이력 포함)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        log.info("프로젝트 상세 조회 요청 - id: {}", id);

        try {
            ProjectResponse projectDetail = projectManagementService.getProjectDetail(id);
            return ResponseEntity.ok(projectDetail);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 상세 조회 실패 - {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 프로젝트 검색 및 필터링
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Project>> searchProjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) ProjectField projectField,
            @RequestParam(required = false) RecruitmentType recruitmentType,
            @RequestParam(required = false) PartnerType partnerType,
            @RequestParam(required = false) BudgetRange budgetType,
            @RequestParam(required = false) Long minBudget,
            @RequestParam(required = false) Long maxBudget,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> techNames,
            @RequestParam(required = false, defaultValue = "recent") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("프로젝트 검색 요청 - keyword: {}, status: {}", keyword, status);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Project> projects = projectManagementService.searchProjects(
                    keyword, status, projectField, recruitmentType, partnerType,
                    budgetType, minBudget, maxBudget, location, techNames, sortBy, pageable);

            return ResponseEntity.ok(projects);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 검색 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ===== 사용자별 조회 API =====

    /**
     * 사용자별 프로젝트 목록 조회 (페이징 + 필터링)
     */
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<Page<ProjectResponse>> getProjectsByManagerId(
            @PathVariable Long managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) ProjectField projectField,
            @RequestParam(required = false) RecruitmentType recruitmentType,
            @RequestParam(required = false) PartnerType partnerType,
            @RequestParam(required = false) BudgetRange budgetType,
            @RequestParam(required = false) Long minBudget,
            @RequestParam(required = false) Long maxBudget,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> techNames,
            @RequestParam(defaultValue = "recent") String sortBy) {

        log.info("사용자 프로젝트 목록 조회 요청 - managerId: {}, page: {}, size: {}", managerId, page, size);

        try {
            Page<ProjectResponse> projects = projectManagementService.getProjectsByManagerId(
                    managerId, page, size, search, status, projectField, recruitmentType, partnerType,
                    budgetType, minBudget, maxBudget, location, techNames, sortBy);

            log.info("사용자별 필터링 결과: {} 건의 프로젝트 반환", projects.getTotalElements());
            return ResponseEntity.ok(projects);
        } catch (IllegalArgumentException e) {
            log.error("사용자 프로젝트 목록 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자별 프로젝트 목록 조회 (기존 방식 - 호환성 유지)
     */
    @GetMapping("/manager/{managerId}/simple")
    public ResponseEntity<List<ProjectResponse>> getProjectsByManagerIdSimple(@PathVariable Long managerId) {
        log.info("사용자 프로젝트 목록 조회 요청 (기존 방식) - managerId: {}", managerId);

        try {
            List<ProjectResponse> projects = projectManagementService.getProjectsByManagerId(managerId);
            return ResponseEntity.ok(projects);
        } catch (IllegalArgumentException e) {
            log.error("사용자 프로젝트 목록 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자 프로젝트 상세 조회 (기술스택 + 상태변경이력 포함)
     */
    @GetMapping("/manager/{managerId}/project/{id}")
    public ResponseEntity<ProjectResponse> getProjectByIdForManager(
            @PathVariable Long managerId,
            @PathVariable Long id) {

        log.info("사용자 프로젝트 상세 조회 요청 - managerId: {}, projectId: {}", managerId, id);

        try {
            ProjectResponse projectDetail = projectManagementService.getProjectDetail(id);
            // TODO: 매니저 권한 체크 로직 필요시 추가
            return ResponseEntity.ok(projectDetail);
        } catch (IllegalArgumentException e) {
            log.error("사용자 프로젝트 상세 조회 실패 - {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            log.error("프로젝트 접근 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    // ===== 생성 API =====

    /**
     * 프로젝트 기본 생성 (필수 입력사항만으로 생성)
     */
    @PostMapping("/basic")
    public ResponseEntity<ApiResponse<ProjectResponse>> createBasicProject(
            @Validated(ProjectRequest.CreateValidation.class) @RequestBody ProjectRequest request) {
        log.info("프로젝트 기본 생성 요청 - title: {}, managerId: {}", request.title(), request.managerId());

        try {
            ProjectResponse createdProject = projectManagementService.createBasicProject(request);
            return ResponseEntity.ok(ApiResponse.success("프로젝트가 성공적으로 생성되었습니다.", createdProject));
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 기본 생성 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 생성 실패", e.getMessage()));
        }
    }

    /**
     * 프로젝트 완전 생성 (기본 정보 + 추가 정보 모두 포함)
     */
    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<ProjectResponse>> createCompleteProject(
            @Validated(ProjectRequest.CreateValidation.class) @RequestBody ProjectRequest request) {
        log.info("프로젝트 완전 생성 요청 - title: {}, managerId: {}", request.title(), request.managerId());

        try {
            ProjectResponse createdProject = projectManagementService.createCompleteProject(request);
            return ResponseEntity.ok(ApiResponse.success("프로젝트가 성공적으로 생성되었습니다.", createdProject));
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 완전 생성 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 생성 실패", e.getMessage()));
        }
    }

    /**
     * 프로젝트 생성 (기존 방식 - 호환성 유지)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody Project project) {
        log.info("프로젝트 생성 요청 (기존 방식) - title: {}", project.getTitle());

        try {
            Project createdProject = projectManagementService.createProject(project);
            return ResponseEntity.ok(ApiResponse.success("프로젝트가 생성되었습니다.", createdProject));
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 생성 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 생성 실패", e.getMessage()));
        }
    }

    // ===== 수정 API =====

    /**
     * 기존 프로젝트에 추가 정보 업데이트 (기본 생성 후 추가 정보 입력)
     */
    @PatchMapping("/{id}/additional-info")
    public ResponseEntity<ApiResponse<ProjectResponse>> completeProjectWithAdditionalInfo(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {

        log.info("프로젝트 추가 정보로 완성 요청 - id: {}", id);

        try {
            ProjectResponse updatedProject = projectManagementService.completeProjectWithAdditionalInfo(id, request);
            return ResponseEntity.ok(ApiResponse.success("프로젝트 정보가 성공적으로 업데이트되었습니다.", updatedProject));
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 추가 정보 완성 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 업데이트 실패", e.getMessage()));
        } catch (SecurityException e) {
            log.error("프로젝트 추가 정보 완성 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("권한이 없습니다.", "PERMISSION_DENIED"));
        }
    }

    /**
     * 프로젝트 수정 (기존 방식)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> updateProject(@PathVariable Long id, @RequestBody Project project) {
        log.info("프로젝트 수정 요청 - id: {}", id);

        try {
            Project updatedProject = projectManagementService.updateProject(id, project);
            return ResponseEntity.ok(ApiResponse.success("프로젝트가 성공적으로 수정되었습니다.", updatedProject));
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 수정 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 수정 실패", e.getMessage()));
        } catch (SecurityException e) {
            log.error("프로젝트 수정 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("권한이 없습니다.", "PERMISSION_DENIED"));
        }
    }

    /**
     * 프로젝트 통합 수정 (모든 정보를 한번에 수정)
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProjectComplete(
            @PathVariable Long id,
            @Validated(ProjectRequest.UpdateValidation.class) @RequestBody ProjectRequest request) {

        log.info("프로젝트 통합 수정 요청 - id: {}", id);

        try {
            ProjectResponse updatedProject = projectManagementService.completeProjectWithAdditionalInfo(id, request);
            return ResponseEntity.ok(ApiResponse.success("프로젝트가 성공적으로 수정되었습니다.", updatedProject));
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 통합 수정 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 수정 실패", e.getMessage()));
        } catch (SecurityException e) {
            log.error("프로젝트 수정 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("권한이 없습니다.", "PERMISSION_DENIED"));
        }
    }

    // ===== 상태 변경 API =====

    /**
     * 프로젝트 상태 변경
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Project>> updateProjectStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProjectStatusChangeRequest request) {

        log.info("프로젝트 상태 변경 요청 - id: {}, status: {}, changedById: {}",
                id, request.status(), request.changedById());

        try {
            Project updatedProject = projectManagementService.updateProjectStatus(id, request.status(), request.changedById());
            return ResponseEntity.ok(ApiResponse.success("프로젝트 상태가 성공적으로 변경되었습니다.", updatedProject));
        } catch (IllegalArgumentException e) {
            log.error("상태 변경 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("상태 변경 실패", e.getMessage()));
        } catch (SecurityException e) {
            log.error("상태 변경 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("권한이 없습니다.", "PERMISSION_DENIED"));
        }
    }

    /**
     * 프로젝트 상태 변경 (기존 방식 - 호환성 유지)
     */
    @PatchMapping("/{id}/status/legacy")
    public ResponseEntity<ApiResponse<Project>> updateProjectStatusLegacy(
            @PathVariable Long id,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Long changedById) {

        log.info("프로젝트 상태 변경 요청 (레거시) - id: {}, status: {}, changedById: {}", id, status, changedById);

        if (status == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 상태(status)는 필수 파라미터입니다.", "MISSING_STATUS"));
        }
        if (changedById == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("변경자 ID(changedById)는 필수 파라미터입니다.", "MISSING_CHANGED_BY_ID"));
        }

        try {
            Project updatedProject = projectManagementService.updateProjectStatus(id, status, changedById);
            return ResponseEntity.ok(ApiResponse.success("프로젝트 상태가 성공적으로 변경되었습니다.", updatedProject));
        } catch (IllegalArgumentException e) {
            log.error("상태 변경 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("상태 변경 실패", e.getMessage()));
        } catch (SecurityException e) {
            log.error("상태 변경 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("권한이 없습니다.", "PERMISSION_DENIED"));
        }
    }

    // ===== 프로젝트 워크플로우 API =====

    /**
     * 프로젝트 계약 시작 (모집중 → 계약중)
     */
    @PatchMapping("/{id}/start-contracting")
    public ResponseEntity<ApiResponse<Project>> startContracting(
            @PathVariable Long id,
            @RequestParam Long managerId) {

        return handleProjectStatusTransition(id, managerId, "계약 시작",
                () -> projectManagementService.startContracting(id, managerId));
    }

    /**
     * 프로젝트 시작 (계약중 → 진행중)
     */
    @PatchMapping("/{id}/start")
    public ResponseEntity<ApiResponse<Project>> startProject(
            @PathVariable Long id,
            @RequestParam Long managerId) {

        return handleProjectStatusTransition(id, managerId, "프로젝트 시작",
                () -> projectManagementService.startProject(id, managerId));
    }

    /**
     * 프로젝트 완료 (진행중 → 완료)
     */
    @PatchMapping("/{id}/mark-complete")
    public ResponseEntity<ApiResponse<Project>> completeProject(
            @PathVariable Long id,
            @RequestParam Long managerId) {

        return handleProjectStatusTransition(id, managerId, "프로젝트 완료",
                () -> projectManagementService.completeProject(id, managerId));
    }

    /**
     * 프로젝트 보류 (계약중/진행중 → 보류)
     */
    @PatchMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<Project>> suspendProject(
            @PathVariable Long id,
            @RequestParam Long managerId) {

        return handleProjectStatusTransition(id, managerId, "프로젝트 보류",
                () -> projectManagementService.suspendProject(id, managerId));
    }

    /**
     * 프로젝트 취소 (모든 상태 → 취소)
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Project>> cancelProject(
            @PathVariable Long id,
            @RequestParam Long managerId) {

        return handleProjectStatusTransition(id, managerId, "프로젝트 취소",
                () -> projectManagementService.cancelProject(id, managerId));
    }

    // ===== 삭제 API =====

    /**
     * 프로젝트 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            @RequestParam Long requesterId) {

        log.info("프로젝트 삭제 요청 - id: {}, requesterId: {}", id, requesterId);

        try {
            projectManagementService.deleteProject(id, requesterId);
            log.info("프로젝트 삭제 성공 - projectId: {}", id);
            return ResponseEntity.ok(ApiResponse.success("프로젝트가 성공적으로 삭제되었습니다.", null));
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 삭제 실패", e.getMessage()));
        } catch (SecurityException e) {
            log.error("프로젝트 삭제 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("권한이 없습니다.", "PERMISSION_DENIED"));
        } catch (Exception e) {
            log.error("프로젝트 삭제 중 예상치 못한 오류 - {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("서버 내부 오류가 발생했습니다.", "INTERNAL_ERROR"));
        }
    }

    /**
     * 사용자 프로젝트 삭제 (매니저 ID가 URL에 포함된 버전)
     */
    @DeleteMapping("/manager/{managerId}/project/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProjectForManager(
            @PathVariable Long managerId,
            @PathVariable Long id) {

        log.info("사용자 프로젝트 삭제 요청 - managerId: {}, id: {}", managerId, id);

        try {
            projectManagementService.deleteProject(id, managerId);
            log.info("사용자 프로젝트 삭제 성공 - managerId: {}, projectId: {}", managerId, id);
            return ResponseEntity.ok(ApiResponse.success("프로젝트가 성공적으로 삭제되었습니다.", null));
        } catch (IllegalArgumentException e) {
            log.error("사용자 프로젝트 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 삭제 실패", e.getMessage()));
        } catch (SecurityException e) {
            log.error("사용자 프로젝트 삭제 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("권한이 없습니다.", "PERMISSION_DENIED"));
        } catch (Exception e) {
            log.error("사용자 프로젝트 삭제 중 예상치 못한 오류 - {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("서버 내부 오류가 발생했습니다.", "INTERNAL_ERROR"));
        }
    }

    // ===== Private 유틸리티 메서드들 =====

    /**
     * 프로젝트 상태 전환을 공통으로 처리하는 메서드
     */
    private ResponseEntity<ApiResponse<Project>> handleProjectStatusTransition(
            Long id, Long managerId, String actionName, ProjectStatusTransitionFunction function) {

        log.info("{} 요청 - id: {}, managerId: {}", actionName, id, managerId);

        try {
            Project updatedProject = function.execute();
            return ResponseEntity.ok(ApiResponse.success(actionName + "이 완료되었습니다.", updatedProject));
        } catch (IllegalArgumentException e) {
            log.error("{} 실패 - {}", actionName, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(actionName + " 실패", e.getMessage()));
        } catch (SecurityException e) {
            log.error("{} 권한 없음 - {}", actionName, e.getMessage());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("권한이 없습니다.", "PERMISSION_DENIED"));
        }
    }

    /**
     * 프로젝트 상태 전환 함수형 인터페이스
     */
    @FunctionalInterface
    private interface ProjectStatusTransitionFunction {
        Project execute() throws IllegalArgumentException, SecurityException;
    }
}
