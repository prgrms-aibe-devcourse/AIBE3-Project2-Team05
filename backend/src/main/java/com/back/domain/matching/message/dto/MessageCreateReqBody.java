package com.back.domain.matching.message.dto;

import com.back.domain.matching.message.entity.RelatedType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 메시지 전송 요청 DTO
 */
public record MessageCreateReqBody(
        @NotNull(message = "수신자 ID는 필수입니다.")
        Long receiverId,

        @NotNull(message = "연관 타입은 필수입니다.")
        RelatedType relatedType,

        @NotNull(message = "연관 ID는 필수입니다.")
        Long relatedId,

        @NotBlank(message = "메시지 내용은 필수입니다.")
        String content
) {
}
