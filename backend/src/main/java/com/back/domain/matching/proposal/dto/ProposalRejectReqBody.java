package com.back.domain.matching.proposal.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 제안 거절 요청 DTO (프리랜서 전용)
 */
public record ProposalRejectReqBody(
        String responseMessage,

        @NotBlank(message = "거절 사유는 필수입니다.")
        String rejectionReason
) {
}
