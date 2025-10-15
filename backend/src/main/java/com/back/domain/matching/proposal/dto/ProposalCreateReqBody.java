package com.back.domain.matching.proposal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 프로젝트 제안 생성 요청 DTO (PM 전용)
 */
public record ProposalCreateReqBody(
        @NotNull(message = "프로젝트 ID는 필수입니다.")
        Long projectId,

        @NotNull(message = "프리랜서 ID는 필수입니다.")
        Long freelancerId,

        @NotBlank(message = "제안 메시지는 필수입니다.")
        String message
) {
}
