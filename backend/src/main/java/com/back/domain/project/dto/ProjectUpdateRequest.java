package com.back.domain.project.dto;

import com.back.domain.project.entity.enums.BudgetRange;
import com.back.domain.project.entity.enums.PartnerType;
import com.back.domain.project.entity.enums.ProjectField;
import com.back.domain.project.entity.enums.RecruitmentType;
import com.back.domain.project.entity.enums.ProgressStatus;
import com.back.domain.project.entity.enums.Region;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

import static com.back.domain.project.dto.ProjectValidationMessages.*;

/**
 * 프로젝트 수정 요청 DTO (모든 정보를 한번에 수정)
 */
public record ProjectUpdateRequest(
        // 기본 정보
        @NotBlank(message = TITLE_REQUIRED)
        @Size(max = 200, message = TITLE_MAX_LENGTH)
        String title,

        @NotBlank(message = DESCRIPTION_REQUIRED)
        String description,

        @NotNull(message = PROJECT_FIELD_REQUIRED)
        ProjectField projectField,

        @NotNull(message = RECRUITMENT_TYPE_REQUIRED)
        RecruitmentType recruitmentType,

        @NotNull(message = BUDGET_TYPE_REQUIRED)
        BudgetRange budgetType,

        @NotNull(message = START_DATE_REQUIRED)
        LocalDate startDate,

        @NotNull(message = END_DATE_REQUIRED)
        LocalDate endDate,

        // 추가 정보
        PartnerType partnerType,

        Long budgetAmount,

        ProgressStatus progressStatus,

        Region companyLocation,

        String partnerEtcDescription,

        // 기술 스택
        List<String> techNames,

        // 파일 관련
        List<Long> attachmentFileIds,

        // 삭제할 파일 ID 목록 (기존 파일 중 삭제할 것들)
        List<Long> filesToDelete
) {}
