package com.back.domain.project.project.controller;

import com.back.domain.project.project.dto.*;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.enums.*;
import com.back.domain.project.project.service.ProjectService;
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
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;

    /**
     * 프로젝트 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<ProjectResponse>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("프로젝트 목록 조회 요청 - page: {}, size: {}", page, size);

        Page<ProjectResponse> projects = projectService.getAllProjects(page, size);
        return ResponseEntity.ok(projects);
    }

    /**
     * 프로젝트 상세 조회 (기술스택 + 상태변경이력 포함)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        log.info("프로젝트 상세 조회 요청 (통합) - id: {}", id);

        Optional<ProjectResponse> projectDetail = projectService.getProjectDetailById(id);

        return projectDetail.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 사용자별 프로젝트 목록 조회
     */
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByManagerId(@PathVariable Long managerId) {
        log.info("사용자 프로젝트 목록 조회 요청 - managerId: {}", managerId);

        List<ProjectResponse> projects = projectService.getProjectsByManagerId(managerId);
        return ResponseEntity.ok(projects);
    }

    /**
     * 사용자 프로젝트 상세 조회 (기술스택 + 상태변경이력 포함)
     */
    @GetMapping("/manager/{managerId}/project/{id}")
    public ResponseEntity<ProjectResponse> getProjectByIdForManager(
            @PathVariable Long managerId,
            @PathVariable Long id) {

        log.info("사용자 프로젝트 상세 조회 요청 (통합) - managerId: {}, projectId: {}", managerId, id);

        try {
            Optional<ProjectResponse> projectDetail = projectService.getProjectDetailByIdForManager(id, managerId);
            return projectDetail.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            log.error("프로젝트 접근 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    /**
     * 프로젝트 기본 생성 (필수 입력사항만으로 생성)
     */
    @PostMapping("/basic")
    public ResponseEntity<ProjectResponse> createBasicProject(
            @Validated(ProjectRequest.CreateValidation.class) @RequestBody ProjectRequest request) {
        log.info("프로젝트 기본 생성 요청 - title: {}, managerId: {}", request.title(), request.managerId());

        try {
            ProjectResponse createdProject = projectService.createBasicProject(request);
            return ResponseEntity.ok(createdProject);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 기본 생성 실패 - 입력값 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 프로젝트 완전 생성 (기본 정보 + 추가 정보 모두 포함)
     */
    @PostMapping("/complete")
    public ResponseEntity<ProjectResponse> createCompleteProject(
            @Validated(ProjectRequest.CreateValidation.class) @RequestBody ProjectRequest request) {
        log.info("프로젝트 완전 생성 요청 - title: {}, managerId: {}", request.title(), request.managerId());

        try {
            ProjectResponse createdProject = projectService.createCompleteProject(request);
            return ResponseEntity.ok(createdProject);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 완전 생성 실패 - 입력값 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 기존 프로젝트에 추가 정보 업데이트 (기본 생성 후 추가 정보 입력)
     */
    @PatchMapping("/{id}/additional-info")
    public ResponseEntity<ProjectResponse> completeProjectWithAdditionalInfo(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {

        log.info("프로젝트 추가 정보로 완성 요청 - id: {}", id);

        try {
            ProjectResponse updatedProject = projectService.completeProjectWithAdditionalInfo(id, request);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 추가 정보 완성 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (SecurityException e) {
            log.error("프로젝트 추가 정보 완성 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    /**
     * 프로젝트 생성 (기존 방식 - 호환성 유지)
     */
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        log.info("프로젝트 생성 요청 - title: {}", project.getTitle());

        try {
            Project createdProject = projectService.createProject(project);
            return ResponseEntity.ok(createdProject);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 생성 실패 - 입력값 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 프로젝트 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project) {
        log.info("프로젝트 수정 요청 - id: {}", id);

        try {
            Project updatedProject = projectService.updateProject(id, project);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 수정 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (SecurityException e) {
            log.error("프로젝트 수정 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    /**
     * 프로젝트 통합 수정 (모든 정보를 한번에 수정)
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> updateProjectComplete(
            @PathVariable Long id,
            @Validated(ProjectRequest.UpdateValidation.class) @RequestBody ProjectRequest request) {

        log.info("프로젝트 통합 수정 요청 - id: {}", id);

        try {
            ProjectResponse updatedProject = projectService.updateProjectComplete(id, request);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 통합 수정 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (SecurityException e) {
            log.error("프로젝트 수정 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    /**
     * 프로젝트 상태 변경
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Project> updateProjectStatus(
            @PathVariable Long id,
            @RequestParam ProjectStatus status,
            @RequestParam Long changedById) {

        log.info("프로젝트 상태 변경 요청 - id: {}, status: {}", id, status);

        try {
            Project updatedProject = projectService.updateProjectStatus(id, status, changedById);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalArgumentException e) {
            log.error("상태 변경 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (SecurityException e) {
            log.error("상태 변경 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    /**
     * 프로젝트 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, @RequestParam Long requesterId) {
        log.info("프로젝트 삭제 요청 - id: {}, requesterId: {}", id, requesterId);

        try {
            projectService.deleteProject(id, requesterId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (SecurityException e) {
            log.error("프로젝트 삭제 권한 없음 - {}", e.getMessage());
            return ResponseEntity.status(403).build();
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

        Pageable pageable = PageRequest.of(page, size);
        Page<Project> projects = projectService.searchProjects(
                keyword, status, projectField, recruitmentType, partnerType,
                budgetType, minBudget, maxBudget, location, techNames, sortBy, pageable);

        return ResponseEntity.ok(projects);
    }
}
