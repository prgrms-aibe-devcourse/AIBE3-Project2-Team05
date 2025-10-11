package com.back.domain.project.project.dto.enums;

/**
 * Enum 응답 DTO들
 */
public class EnumResponseDto {

    /**
     * 기본 Enum 응답 형식
     */
    public record EnumResponse(String value, String description) {}

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
