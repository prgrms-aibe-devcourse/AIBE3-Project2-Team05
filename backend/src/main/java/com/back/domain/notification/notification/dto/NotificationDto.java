package com.back.domain.notification.notification.dto;

import com.back.domain.notification.notification.entity.Notification;
import com.back.domain.notification.notification.entity.NotificationType;

import java.time.LocalDateTime;

/**
 * 알림 응답 DTO
 */
public record NotificationDto(
        Long id,
        NotificationType notificationType,
        String title,
        String content,
        String relatedType,
        Long relatedId,
        boolean isRead,
        LocalDateTime createdAt
) {
    /**
     * Entity를 DTO로 변환
     */
    public NotificationDto(Notification notification) {
        this(
                notification.getId(),
                notification.getNotificationType(),
                notification.getTitle(),
                notification.getContent(),
                notification.getRelatedType(),
                notification.getRelatedId(),
                notification.isRead(),
                notification.getCreateDate()
        );
    }
}
