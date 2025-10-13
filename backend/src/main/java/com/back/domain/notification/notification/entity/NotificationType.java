package com.back.domain.notification.notification.entity;

/**
 * 알림 타입
 */
public enum NotificationType {
    /**
     * 새 제안 받음 (프리랜서)
     */
    PROPOSAL_RECEIVED,

    /**
     * 제안 수락됨 (PM)
     */
    PROPOSAL_ACCEPTED,

    /**
     * 제안 거절됨 (PM)
     */
    PROPOSAL_REJECTED,

    /**
     * 새 메시지 받음 (양방향)
     */
    MESSAGE_RECEIVED,

    /**
     * 지원 수락됨 (프리랜서)
     */
    SUBMISSION_ACCEPTED,

    /**
     * 지원 거절됨 (프리랜서)
     */
    SUBMISSION_REJECTED
}
