package com.back.domain.project.project.controller;

import com.back.domain.project.project.entity.enums.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 프로젝트 관련 Enum 값 조회 전용 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/projects/enums")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectEnumController {

    /**
     * Region enum 값 목록 조회
     */
    @GetMapping("/regions")
    public ResponseEntity<List<RegionResponse>> getRegionOptions() {
        log.info("지역 옵션 조회 요청");

        List<RegionResponse> regionOptions = java.util.Arrays.stream(Region.values())
                .map(region -> new RegionResponse(region.name(), region.getDescription()))
                .toList();

        return ResponseEntity.ok(regionOptions);
    }

    /**
     * ProgressStatus enum 값 목록 조회
     */
    @GetMapping("/progress-status")
    public ResponseEntity<List<ProgressStatusResponse>> getProgressStatusOptions() {
        log.info("진행 상황 옵션 조회 요청");

        List<ProgressStatusResponse> progressStatusOptions = java.util.Arrays.stream(ProgressStatus.values())
                .map(status -> new ProgressStatusResponse(status.name(), status.getDescription()))
                .toList();

        return ResponseEntity.ok(progressStatusOptions);
    }

    /**
     * ProjectField enum 값 목록 조회
     */
    @GetMapping("/project-fields")
    public ResponseEntity<List<ProjectFieldResponse>> getProjectFieldOptions() {
        log.info("프로젝트 분야 옵션 조회 요청");

        List<ProjectFieldResponse> projectFieldOptions = java.util.Arrays.stream(ProjectField.values())
                .map(field -> new ProjectFieldResponse(field.name(), field.getDescription()))
                .toList();

        return ResponseEntity.ok(projectFieldOptions);
    }

    /**
     * BudgetRange enum 값 목록 조회
     */
    @GetMapping("/budget-ranges")
    public ResponseEntity<List<BudgetRangeResponse>> getBudgetRangeOptions() {
        log.info("예산 범위 옵션 조회 요청");

        List<BudgetRangeResponse> budgetRangeOptions = java.util.Arrays.stream(BudgetRange.values())
                .map(budget -> new BudgetRangeResponse(budget.name(), budget.getDescription()))
                .toList();

        return ResponseEntity.ok(budgetRangeOptions);
    }

    /**
     * PartnerType enum 값 목록 조회
     */
    @GetMapping("/partner-types")
    public ResponseEntity<List<PartnerTypeResponse>> getPartnerTypeOptions() {
        log.info("파트너 유형 옵션 조회 요청");

        List<PartnerTypeResponse> partnerTypeOptions = java.util.Arrays.stream(PartnerType.values())
                .map(partner -> new PartnerTypeResponse(partner.name(), partner.getDescription()))
                .toList();

        return ResponseEntity.ok(partnerTypeOptions);
    }

    /**
     * RecruitmentType enum 값 목록 조회
     */
    @GetMapping("/recruitment-types")
    public ResponseEntity<List<RecruitmentTypeResponse>> getRecruitmentTypeOptions() {
        log.info("모집 형태 옵션 조회 요청");

        List<RecruitmentTypeResponse> recruitmentTypeOptions = java.util.Arrays.stream(RecruitmentType.values())
                .map(recruitment -> new RecruitmentTypeResponse(recruitment.name(), recruitment.getDescription()))
                .toList();

        return ResponseEntity.ok(recruitmentTypeOptions);
    }

    // ===== 응답 DTO들 =====

    /**
     * Region 응답 DTO
     */
    public record RegionResponse(String value, String description) {}

    /**
     * ProgressStatus 응답 DTO
     */
    public record ProgressStatusResponse(String value, String description) {}

    /**
     * ProjectField 응답 DTO
     */
    public record ProjectFieldResponse(String value, String description) {}

    /**
     * BudgetRange 응답 DTO
     */
    public record BudgetRangeResponse(String value, String description) {}

    /**
     * PartnerType 응답 DTO
     */
    public record PartnerTypeResponse(String value, String description) {}

    /**
     * RecruitmentType 응답 DTO
     */
    public record RecruitmentTypeResponse(String value, String description) {}
}
