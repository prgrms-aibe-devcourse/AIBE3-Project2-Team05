package com.back.domain.notification.notification.entity;

import com.back.domain.member.member.entity.Member;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 알림 엔티티
 */
@Entity
@Table(name = "notification")
@Getter
@NoArgsConstructor
public class Notification extends BaseEntity {

    /**
     * 알림 받을 회원
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /**
     * 알림 타입
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", length = 50, nullable = false)
    private NotificationType notificationType;

    /**
     * 알림 제목
     */
    @Column(name = "title", length = 100, nullable = false)
    private String title;

    /**
     * 알림 내용
     */
    @Column(name = "content", length = 500)
    private String content;

    /**
     * 관련 엔티티 타입 (PROPOSAL, MESSAGE, SUBMISSION)
     */
    @Column(name = "related_type", length = 50)
    private String relatedType;

    /**
     * 관련 엔티티 ID
     */
    @Column(name = "related_id")
    private Long relatedId;

    /**
     * 읽음 여부
     */
    @Column(name = "is_read")
    private boolean isRead = false;

    /**
     * 생성자
     */
    public Notification(Member member, NotificationType notificationType, String title,
                       String content, String relatedType, Long relatedId) {
        this.member = member;
        this.notificationType = notificationType;
        this.title = title;
        this.content = content;
        this.relatedType = relatedType;
        this.relatedId = relatedId;
    }

    /**
     * 읽음 처리
     */
    public void markAsRead() {
        this.isRead = true;
    }
}
