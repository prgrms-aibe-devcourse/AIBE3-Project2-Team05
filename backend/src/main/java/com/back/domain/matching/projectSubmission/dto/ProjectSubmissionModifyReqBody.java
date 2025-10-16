package com.back.domain.matching.projectSubmission.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 프로젝트 지원 수정 요청 DTO
 */
public record ProjectSubmissionModifyReqBody(
        @NotBlank(message = "자기소개서는 필수입니다.")
        @Size(min = 5, message = "자기소개서는 최소 5자 이상이어야 합니다.")
        String coverLetter,

        @NotNull(message = "제안 단가는 필수입니다.")
        @Min(value = 0, message = "제안 단가는 0보다 커야 합니다.")
        Integer proposedRate,

        @NotNull(message = "예상 소요 기간은 필수입니다.")
        @Min(value = 1, message = "예상 소요 기간은 1일 이상이어야 합니다.")
        Integer estimatedDuration,

        List<PortfolioItemDto> portfolio
) {
}
