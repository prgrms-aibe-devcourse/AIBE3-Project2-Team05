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

    // ===== 생성 API =====

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

    // ===== 수정 API =====

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
}
