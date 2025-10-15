package com.back.domain.matching.message.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.entity.Project;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메시지 Entity
 * PM과 프리랜서 간 1:1 메시지를 저장
 */
@Entity
@Table(
    name = "messages",
    indexes = {
        @Index(name = "idx_project", columnList = "project_id"),
        @Index(name = "idx_pm_freelancer", columnList = "project_manager_id, freelancer_member_id"),
        @Index(name = "idx_related", columnList = "related_type, related_id"),
        @Index(name = "idx_receiver_unread", columnList = "freelancer_member_id, is_read"),
        @Index(name = "idx_created_at", columnList = "createDate")
    }
)
@Getter
@NoArgsConstructor
public class Message extends BaseEntity {

    /**
     * 메시지가 속한 프로젝트
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * 프로젝트 매니저 (PM)
     * 대화의 한 쪽 참여자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id", nullable = false)
    private Member pm;

    /**
     * 프리랜서
     * 대화의 다른 쪽 참여자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_member_id", nullable = false)
    private Freelancer freelancer;

    /**
     * 메시지 발신자
     * PM 또는 프리랜서 중 한 명
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_member_id", nullable = false)
    private Member sender;

    /**
     * 연관 타입
     * SUBMISSION: 지원과 관련된 메시지
     * PROPOSAL: 제안과 관련된 메시지
     * PROJECT: 일반 프로젝트 문의
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "related_type", nullable = false)
    private RelatedType relatedType;

    /**
     * 연관 ID
     * related_type에 따라 submission.id, proposal.id, 또는 project.id
     */
    @Column(name = "related_id", nullable = false)
    private Long relatedId;

    /**
     * 메시지 내용
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * 읽음 여부
     * 수신자가 메시지를 읽었는지 표시
     */
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    /**
     * 읽은 일시
     * 수신자가 메시지를 읽은 시간
     */
    @Column(name = "read_at")
    private LocalDateTime readAt;

    /**
     * 생성자 - 메시지 생성
     *
     * @param project     메시지가 속한 프로젝트
     * @param pm          PM
     * @param freelancer  프리랜서
     * @param sender      발신자 (PM 또는 프리랜서)
     * @param relatedType 연관 타입
     * @param relatedId   연관 ID
     * @param content     메시지 내용
     */
    public Message(
            Project project,
            Member pm,
            Freelancer freelancer,
            Member sender,
            RelatedType relatedType,
            Long relatedId,
            String content
    ) {
        this.project = project;
        this.pm = pm;
        this.freelancer = freelancer;
        this.sender = sender;
        this.relatedType = relatedType;
        this.relatedId = relatedId;
        this.content = content;
        this.isRead = false;
    }

    /**
     * 메시지 읽음 처리
     * 수신자가 메시지를 확인할 때 호출
     */
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    /**
     * 수신자 확인
     * sender가 아닌 사람이 수신자
     *
     * @param member 확인할 멤버
     * @return 수신자면 true
     */
    public boolean isReceiver(Member member) {
        // PM이 발신자면 프리랜서가 수신자
        if (this.sender.getId().equals(this.pm.getId())) {
            return member.getId().equals(this.freelancer.getId());
        }
        // 프리랜서가 발신자면 PM이 수신자
        return member.getId().equals(this.pm.getId());
    }

    /**
     * 대화 참여자 확인
     * 이 메시지의 PM 또는 프리랜서인지 확인
     *
     * @param member 확인할 멤버
     * @return 참여자면 true
     */
    public boolean isParticipant(Member member) {
        return member.getId().equals(this.pm.getId()) ||
               member.getId().equals(this.freelancer.getId());
    }
}
