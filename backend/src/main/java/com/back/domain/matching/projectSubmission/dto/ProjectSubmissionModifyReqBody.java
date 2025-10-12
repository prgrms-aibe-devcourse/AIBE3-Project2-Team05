package com.back.domain.matching.projectSubmission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 프로젝트 지원 수정 요청 DTO
 */
public record ProjectSubmissionModifyReqBody(
        @NotNull(message = "포트폴리오 ID는 필수입니다.")
        Long portfolioId,

        @NotBlank(message = "자기소개서는 필수입니다.")
        String coverLetter
) {
}
