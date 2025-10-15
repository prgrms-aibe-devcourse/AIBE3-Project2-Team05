package com.back.domain.notification.notification.repository;

import com.back.domain.member.member.entity.Member;
import com.back.domain.notification.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 알림 Repository
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 회원의 알림 목록 조회 (최신순)
     */
    List<Notification> findByMemberOrderByCreateDateDesc(Member member);

    /**
     * 회원의 읽지 않은 알림 목록 조회
     */
    List<Notification> findByMemberAndIsReadFalseOrderByCreateDateDesc(Member member);

    /**
     * 회원의 읽지 않은 알림 개수
     */
    long countByMemberAndIsReadFalse(Member member);

    /**
     * 회원의 모든 알림 읽음 처리
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.member = :member AND n.isRead = false")
    int markAllAsRead(@Param("member") Member member);
}
