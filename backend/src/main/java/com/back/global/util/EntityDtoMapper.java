package com.back.global.util;

import com.back.domain.project.dto.ProjectRequest;
import com.back.domain.project.entity.Project;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity ↔ DTO 매핑 유틸리티 클래스
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class EntityDtoMapper {

    // ===== Project 매핑 =====

    /**
     * ProjectRequest → Project 엔티티 변환 (기본 생성용)
     */
    public static Project toEntity(ProjectRequest request) {
        return Project.builder()
                .title(request.title())
                .description(request.description())
                .projectField(request.projectField())
                .recruitmentType(request.recruitmentType())
                .budgetType(request.budgetType())
                .startDate(request.startDate())
                .endDate(request.endDate())
                // managerId는 서비스에서 Member 객체로 설정
                .partnerType(request.partnerType())
                .budgetAmount(request.budgetAmount())
                .progressStatus(request.progressStatus())
                .companyLocation(request.companyLocation())
                .partnerEtcDescription(request.partnerEtcDescription())
                .viewCount(0)
                .createDate(LocalDateTime.now())
                .build();
    }

    /**
     * Project 엔티티에 ProjectRequest 적용 (수정용)
     */
    public static void updateEntity(Project project, ProjectRequest request) {
        updateFieldIfNotNull(request.title(), project::setTitle);
        updateFieldIfNotNull(request.description(), project::setDescription);
        updateFieldIfNotNull(request.projectField(), project::setProjectField);
        updateFieldIfNotNull(request.recruitmentType(), project::setRecruitmentType);
        updateFieldIfNotNull(request.budgetType(), project::setBudgetType);
        updateFieldIfNotNull(request.startDate(), project::setStartDate);
        updateFieldIfNotNull(request.endDate(), project::setEndDate);
        updateFieldIfNotNull(request.partnerType(), project::setPartnerType);
        updateFieldIfNotNull(request.budgetAmount(), project::setBudgetAmount);
        updateFieldIfNotNull(request.progressStatus(), project::setProgressStatus);
        updateFieldIfNotNull(request.companyLocation(), project::setCompanyLocation);
        updateFieldIfNotNull(request.partnerEtcDescription(), project::setPartnerEtcDescription);

        project.setModifyDate(LocalDateTime.now());
    }

    // ===== Helper Methods =====

    /**
     * null이 아닌 값만 업데이트하는 헬퍼 메서드
     */
    private static <T> void updateFieldIfNotNull(T value, java.util.function.Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }
}
