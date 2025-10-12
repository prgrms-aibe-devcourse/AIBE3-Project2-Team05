package com.back.domain.matching.projectSubmission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 프로젝트 지원 생성 요청 DTO
 */
public record ProjectSubmissionCreateReqBody(
        @NotNull(message = "프로젝트 ID는 필수입니다.")
        Long projectId,

        @NotNull(message = "포트폴리오 ID는 필수입니다.")
        Long portfolioId,

        @NotBlank(message = "자기소개서는 필수입니다.")
        String coverLetter
) {
}
