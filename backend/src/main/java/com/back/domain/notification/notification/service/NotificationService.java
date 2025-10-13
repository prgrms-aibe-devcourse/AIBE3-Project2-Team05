package com.back.domain.notification.notification.service;

import com.back.domain.member.member.entity.Member;
import com.back.domain.notification.notification.entity.Notification;
import com.back.domain.notification.notification.entity.NotificationType;
import com.back.domain.notification.notification.repository.NotificationRepository;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 알림 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * 알림 생성
     */
    @Transactional
    public Notification create(Member member, NotificationType notificationType,
                              String title, String content,
                              String relatedType, Long relatedId) {
        Notification notification = new Notification(
                member,
                notificationType,
                title,
                content,
                relatedType,
                relatedId
        );

        return notificationRepository.save(notification);
    }

    /**
     * 회원의 알림 목록 조회
     */
    public List<Notification> findByMember(Member member) {
        return notificationRepository.findByMemberOrderByCreateDateDesc(member);
    }

    /**
     * 회원의 읽지 않은 알림 목록 조회
     */
    public List<Notification> findUnreadByMember(Member member) {
        return notificationRepository.findByMemberAndIsReadFalseOrderByCreateDateDesc(member);
    }

    /**
     * 읽지 않은 알림 개수
     */
    public long countUnreadByMember(Member member) {
        return notificationRepository.countByMemberAndIsReadFalse(member);
    }

    /**
     * 알림 ID로 조회
     */
    public Notification findById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 알림입니다."));
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markAsRead(Notification notification, Member member) {
        // 권한 확인
        if (!notification.getMember().getId().equals(member.getId())) {
            throw new ServiceException("403-1", "알림을 읽을 권한이 없습니다.");
        }

        notification.markAsRead();
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public int markAllAsRead(Member member) {
        return notificationRepository.markAllAsRead(member);
    }

    /**
     * 알림 삭제
     */
    @Transactional
    public void delete(Notification notification, Member member) {
        // 권한 확인
        if (!notification.getMember().getId().equals(member.getId())) {
            throw new ServiceException("403-1", "알림을 삭제할 권한이 없습니다.");
        }

        notificationRepository.delete(notification);
    }
}
