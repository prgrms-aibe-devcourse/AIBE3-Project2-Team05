package com.back.domain.matching.projectSubmission.dto;

import com.back.domain.matching.projectSubmission.entity.SubmissionStatus;
import jakarta.validation.constraints.NotNull;

/**
 * 지원 상태 변경 요청 DTO (PM 전용)
 */
public record ProjectSubmissionStatusUpdateReqBody(
        @NotNull(message = "변경할 상태는 필수입니다.")
        SubmissionStatus status,

        String message
) {
}
