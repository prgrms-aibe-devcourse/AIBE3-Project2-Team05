package com.back.domain.notification.notification.controller;

import com.back.domain.member.member.entity.Member;
import com.back.domain.notification.notification.dto.NotificationDto;
import com.back.domain.notification.notification.entity.Notification;
import com.back.domain.notification.notification.service.NotificationService;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 알림 API Controller
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class ApiV1NotificationController {

    private final NotificationService notificationService;

    /**
     * 알림 목록 조회
     *
     * @param user       현재 로그인한 사용자
     * @param unreadOnly 읽지 않은 알림만 조회 (선택)
     * @return 알림 목록
     */
    @GetMapping
    public RsData<List<NotificationDto>> getNotifications(
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly
    ) {
        Member member = user.getMember();
        List<Notification> notifications = unreadOnly
                ? notificationService.findUnreadByMember(member)
                : notificationService.findByMember(member);

        List<NotificationDto> dtos = notifications.stream()
                .map(NotificationDto::new)
                .toList();

        return new RsData<>(
                "200-1",
                "알림 목록이 조회되었습니다.",
                dtos
        );
    }

    /**
     * 읽지 않은 알림 개수 조회
     *
     * @param user 현재 로그인한 사용자
     * @return 읽지 않은 알림 개수
     */
    @GetMapping("/unread-count")
    public RsData<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal SecurityUser user
    ) {
        Member member = user.getMember();
        long count = notificationService.countUnreadByMember(member);

        return new RsData<>(
                "200-1",
                "읽지 않은 알림 개수가 조회되었습니다.",
                Map.of("count", count)
        );
    }

    /**
     * 알림 읽음 처리
     *
     * @param user 현재 로그인한 사용자
     * @param id   알림 ID
     * @return 성공 메시지
     */
    @PutMapping("/{id}/read")
    @Transactional
    public RsData<Void> markAsRead(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id
    ) {
        Notification notification = notificationService.findById(id);
        notificationService.markAsRead(notification, user.getMember());

        return new RsData<>(
                "200-1",
                "알림을 읽음 처리했습니다."
        );
    }

    /**
     * 모든 알림 읽음 처리
     *
     * @param user 현재 로그인한 사용자
     * @return 성공 메시지
     */
    @PutMapping("/read-all")
    @Transactional
    public RsData<Map<String, Integer>> markAllAsRead(
            @AuthenticationPrincipal SecurityUser user
    ) {
        int count = notificationService.markAllAsRead(user.getMember());

        return new RsData<>(
                "200-1",
                "모든 알림을 읽음 처리했습니다.",
                Map.of("count", count)
        );
    }

    /**
     * 알림 삭제
     *
     * @param user 현재 로그인한 사용자
     * @param id   알림 ID
     * @return 성공 메시지
     */
    @DeleteMapping("/{id}")
    @Transactional
    public RsData<Void> delete(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id
    ) {
        Notification notification = notificationService.findById(id);
        notificationService.delete(notification, user.getMember());

        return new RsData<>(
                "200-1",
                "알림이 삭제되었습니다."
        );
    }
}
