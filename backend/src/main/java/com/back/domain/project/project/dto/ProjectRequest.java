package com.back.domain.project.project.dto;

import com.back.domain.project.project.entity.enums.BudgetRange;
import com.back.domain.project.project.entity.enums.PartnerType;
import com.back.domain.project.project.entity.enums.ProjectField;
import com.back.domain.project.project.entity.enums.RecruitmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

import static com.back.domain.project.project.dto.ProjectValidationMessages.*;

/**
 * 프로젝트 생성/수정 통합 요청 DTO
 * - 생성: 필수 필드만 입력, 선택 필드는 null
 * - 완전 생성: 모든 필드 입력
 * - 수정: 변경할 필드만 입력
 */
public record ProjectRequest(
        // === 필수 필드 (생성 시) ===
        @NotBlank(message = TITLE_REQUIRED, groups = CreateValidation.class)
        @Size(max = 200, message = TITLE_MAX_LENGTH)
        String title,

        @NotBlank(message = DESCRIPTION_REQUIRED, groups = CreateValidation.class)
        String description,

        @NotNull(message = PROJECT_FIELD_REQUIRED, groups = CreateValidation.class)
        ProjectField projectField,

        @NotNull(message = RECRUITMENT_TYPE_REQUIRED, groups = CreateValidation.class)
        RecruitmentType recruitmentType,

        @NotNull(message = BUDGET_TYPE_REQUIRED, groups = CreateValidation.class)
        BudgetRange budgetType,

        @NotNull(message = START_DATE_REQUIRED, groups = CreateValidation.class)
        LocalDate startDate,

        @NotNull(message = END_DATE_REQUIRED, groups = CreateValidation.class)
        LocalDate endDate,

        @NotNull(message = MANAGER_ID_REQUIRED, groups = CreateValidation.class)
        Long managerId,

        // === 선택 필드 ===
        PartnerType partnerType,

        Long budgetAmount,

        @Size(max = 100, message = PROGRESS_STATUS_MAX_LENGTH)
        String progressStatus,

        @Size(max = 100, message = COMPANY_LOCATION_MAX_LENGTH)
        String companyLocation,

        String partnerEtcDescription,

        // 기술 스택
        List<String> techNames,

        // 파일 관련 (수정 시에만 사용)
        List<Long> attachmentFileIds,
        List<Long> filesToDelete
) {

    // 검증 그룹 인터페이스
    public interface CreateValidation {}
    public interface UpdateValidation {}

    /**
     * 기본 생성용 (필수 필드만)
     */
    public static ProjectRequest forBasicCreate(String title, String description,
                                              ProjectField projectField, RecruitmentType recruitmentType,
                                              BudgetRange budgetType, LocalDate startDate,
                                              LocalDate endDate, Long managerId, List<String> techNames) {
        return new ProjectRequest(title, description, projectField, recruitmentType, budgetType,
                startDate, endDate, managerId, null, null, null, null, null, techNames, null, null);
    }

    /**
     * 완전 생성용 (모든 필드)
     */
    public static ProjectRequest forCompleteCreate(String title, String description,
                                                 ProjectField projectField, RecruitmentType recruitmentType,
                                                 BudgetRange budgetType, LocalDate startDate, LocalDate endDate,
                                                 Long managerId, PartnerType partnerType, Long budgetAmount,
                                                 String progressStatus, String companyLocation,
                                                 String partnerEtcDescription, List<String> techNames) {
        return new ProjectRequest(title, description, projectField, recruitmentType, budgetType,
                startDate, endDate, managerId, partnerType, budgetAmount, progressStatus,
                companyLocation, partnerEtcDescription, techNames, null, null);
    }

    /**
     * 추가 정보만 (기본 생성 후 추가 정보 입력용)
     */
    public static ProjectRequest forAdditionalInfo(PartnerType partnerType, Long budgetAmount,
                                                 String progressStatus, String companyLocation,
                                                 String partnerEtcDescription, List<String> techNames,
                                                 List<Long> attachmentFileIds) {
        return new ProjectRequest(null, null, null, null, null, null, null, null,
                partnerType, budgetAmount, progressStatus, companyLocation, partnerEtcDescription,
                techNames, attachmentFileIds, null);
    }
}
