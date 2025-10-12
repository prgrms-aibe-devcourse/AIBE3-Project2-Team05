package com.back.domain.matching.message.dto;

import com.back.domain.matching.message.entity.Message;
import com.back.domain.matching.message.entity.RelatedType;

import java.time.LocalDateTime;

/**
 * 메시지 응답 DTO
 */
public record MessageDto(
        Long id,
        Long projectId,
        String projectTitle,
        Long pmId,
        String pmName,
        Long freelancerId,
        String freelancerName,
        Long senderId,
        String senderName,
        RelatedType relatedType,
        Long relatedId,
        String content,
        boolean isRead,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
    /**
     * Entity를 DTO로 변환
     */
    public MessageDto(Message message) {
        this(
                message.getId(),
                message.getProject().getId(),
                message.getProject().getTitle(),
                message.getPm().getId(),
                message.getPm().getNickname(),
                message.getFreelancer().getId(),
                message.getFreelancer().getName(),
                message.getSender().getId(),
                message.getSender().getNickname(),
                message.getRelatedType(),
                message.getRelatedId(),
                message.getContent(),
                message.isRead(),
                message.getReadAt(),
                message.getCreateDate()
        );
    }
}
