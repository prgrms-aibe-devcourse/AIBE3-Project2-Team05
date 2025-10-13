package com.back.domain.matching.message.controller;

import com.back.domain.matching.message.dto.MessageCreateReqBody;
import com.back.domain.matching.message.dto.MessageDto;
import com.back.domain.matching.message.entity.Message;
import com.back.domain.matching.message.entity.RelatedType;
import com.back.domain.matching.message.service.MessageService;
import com.back.domain.member.member.entity.Member;
import com.back.global.exception.ServiceException;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 메시지 API Controller
 */
@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class ApiV1MessageController {

    private final MessageService messageService;

    /**
     * 메시지 전송
     *
     * @param user    현재 로그인한 사용자
     * @param reqBody 메시지 정보
     * @return 전송된 메시지 정보
     */
    @PostMapping
    @Transactional
    public RsData<MessageDto> send(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody MessageCreateReqBody reqBody
    ) {
        Member sender = user.getMember();

        Message message = messageService.send(
                sender,
                reqBody.receiverId(),
                reqBody.relatedType(),
                reqBody.relatedId(),
                reqBody.content()
        );

        return new RsData<>(
                "201-1",
                "메시지가 전송되었습니다.",
                new MessageDto(message)
        );
    }

    /**
     * 특정 프로젝트+프리랜서 간의 대화 히스토리 조회 (채팅 모달용)
     *
     * @param user         현재 로그인한 사용자
     * @param projectId    프로젝트 ID
     * @param freelancerId 프리랜서 ID
     * @param limit        조회할 메시지 개수 (기본 50개)
     * @return 메시지 목록 (날짜 오름차순)
     */
    @GetMapping("/conversation/{projectId}/{freelancerId}")
    public RsData<List<MessageDto>> getConversation(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long projectId,
            @PathVariable Long freelancerId,
            @RequestParam(required = false, defaultValue = "50") int limit
    ) {
        Member member = user.getMember();

        List<Message> messages = messageService.findConversation(
                member,
                projectId,
                freelancerId,
                limit
        );

        List<MessageDto> dtos = messages.stream()
                .map(MessageDto::new)
                .toList();

        return new RsData<>(
                "200-1",
                "대화 히스토리가 조회되었습니다.",
                dtos
        );
    }

    /**
     * 메시지 목록 조회
     * - 전체 메시지 또는 필터링된 메시지 조회
     *
     * @param user        현재 로그인한 사용자
     * @param relatedType 연관 타입 (선택)
     * @param relatedId   연관 ID (선택)
     * @param unreadOnly  읽지 않은 메시지만 조회 (선택)
     * @return 메시지 목록
     */
    @GetMapping
    public RsData<List<MessageDto>> getMessages(
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam(required = false) RelatedType relatedType,
            @RequestParam(required = false) Long relatedId,
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly
    ) {
        Member member = user.getMember();
        List<Message> messages;

        if (unreadOnly) {
            // 읽지 않은 메시지만 조회
            messages = messageService.findUnreadMessages(member);
        } else if (relatedType != null && relatedId != null) {
            // TODO: 특정 대화 조회 (PM과 프리랜서 정보 필요)
            // 임시: 전체 메시지 조회
            messages = messageService.findByMember(member);
        } else {
            // 전체 메시지 조회
            messages = messageService.findByMember(member);
        }

        List<MessageDto> dtos = messages.stream()
                .map(MessageDto::new)
                .toList();

        return new RsData<>(
                "200-1",
                "메시지 목록이 조회되었습니다.",
                dtos
        );
    }

    /**
     * 메시지 상세 조회
     *
     * @param user 현재 로그인한 사용자
     * @param id   메시지 ID
     * @return 메시지 상세 정보
     */
    @GetMapping("/{id}")
    public RsData<MessageDto> getMessage(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id
    ) {
        Message message = messageService.findById(id);

        // 권한 확인 (대화 참여자만 조회 가능)
        if (!message.isParticipant(user.getMember())) {
            throw new ServiceException("403-1", "메시지를 볼 권한이 없습니다.");
        }

        return new RsData<>(
                "200-1",
                "메시지가 조회되었습니다.",
                new MessageDto(message)
        );
    }

    /**
     * 메시지 읽음 처리
     *
     * @param user 현재 로그인한 사용자
     * @param id   메시지 ID
     * @return 성공 메시지
     */
    @PutMapping("/{id}/read")
    @Transactional
    public RsData<Void> markAsRead(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id
    ) {
        Message message = messageService.findById(id);
        Member reader = user.getMember();

        messageService.markAsRead(message, reader);

        return new RsData<>(
                "200-1",
                "메시지를 읽음 처리했습니다."
        );
    }
}
