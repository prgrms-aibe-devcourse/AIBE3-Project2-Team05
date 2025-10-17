package com.back.domain.matching.message.dto;

import com.back.domain.matching.message.entity.Message;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 대화방 DTO
 * 프로젝트별 PM-프리랜서 간의 대화방 정보
 */
@Getter
public class ConversationDto {
    private final Long projectId;
    private final String projectTitle;
    private final Long freelancerId;
    private final Long freelancerMemberId;
    private final String freelancerName;
    private final Long pmId;
    private final String pmName;
    private final String lastMessage;
    private final LocalDateTime lastMessageAt;
    private final int unreadCount;
    private final String relatedType;
    private final Long relatedId;

    /**
     * 메시지 리스트로부터 대화방 정보 생성
     *
     * @param messages      같은 대화방의 메시지들 (최신순 정렬)
     * @param currentUserId 현재 사용자 ID (읽지 않은 메시지 카운트용)
     */
    public ConversationDto(List<Message> messages, Long currentUserId) {
        if (messages.isEmpty()) {
            throw new IllegalArgumentException("메시지 목록이 비어있습니다.");
        }

        Message latestMessage = messages.get(0);

        this.projectId = latestMessage.getProject().getId();
        this.projectTitle = latestMessage.getProject().getTitle();
        this.freelancerId = latestMessage.getFreelancer().getId();
        this.freelancerMemberId = latestMessage.getFreelancer().getMember().getId();
        this.freelancerName = latestMessage.getFreelancer().getMember().getNickname();
        this.pmId = latestMessage.getPm().getId();
        this.pmName = latestMessage.getPm().getNickname();
        this.lastMessage = latestMessage.getContent();
        this.lastMessageAt = latestMessage.getCreateDate();
        this.relatedType = latestMessage.getRelatedType() != null ? latestMessage.getRelatedType().name() : null;
        this.relatedId = latestMessage.getRelatedId();

        // 현재 사용자가 수신자인 읽지 않은 메시지 개수 계산
        this.unreadCount = (int) messages.stream()
                .filter(msg -> !msg.isRead() && msg.isReceiver(getCurrentMember(latestMessage, currentUserId)))
                .count();
    }

    /**
     * 현재 사용자의 Member 객체 가져오기
     */
    private com.back.domain.member.member.entity.Member getCurrentMember(Message message, Long currentUserId) {
        if (message.getPm().getId().equals(currentUserId)) {
            return message.getPm();
        } else {
            return message.getFreelancer().getMember();
        }
    }

    /**
     * 마지막 메시지 내용 (30자 제한)
     */
    public String getLastMessagePreview() {
        if (lastMessage.length() <= 30) {
            return lastMessage;
        }
        return lastMessage.substring(0, 30) + "...";
    }
}
