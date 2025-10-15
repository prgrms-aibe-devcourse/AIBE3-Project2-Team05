package com.back.domain.matching.message.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.matching.message.dto.ConversationDto;
import com.back.domain.matching.message.entity.Message;
import com.back.domain.matching.message.entity.RelatedType;
import com.back.domain.matching.message.repository.MessageRepository;
import com.back.domain.matching.proposal.entity.Proposal;
import com.back.domain.matching.proposal.repository.ProposalRepository;
import com.back.domain.matching.projectSubmission.entity.ProjectSubmission;
import com.back.domain.matching.projectSubmission.repository.ProjectSubmissionRepository;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.notification.notification.entity.NotificationType;
import com.back.domain.notification.notification.service.NotificationService;
import com.back.domain.project.entity.Project;
import com.back.domain.project.repository.ProjectRepository;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 메시지 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;
    private final MemberRepository memberRepository;
    private final FreelancerRepository freelancerRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSubmissionRepository projectSubmissionRepository;
    private final ProposalRepository proposalRepository;
    private final NotificationService notificationService;

    /**
     * 메시지 전송
     *
     * @param sender      발신자
     * @param receiverId  수신자 ID
     * @param relatedType 연관 타입
     * @param relatedId   연관 ID
     * @param content     메시지 내용
     * @return 생성된 메시지
     */
    @Transactional
    public Message send(
            Member sender,
            Long receiverId,
            RelatedType relatedType,
            Long relatedId,
            String content
    ) {
        // 수신자 조회
        Member receiver = memberRepository.findById(receiverId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 수신자입니다."));

        // 연관 항목에 따라 권한 확인 및 정보 추출
        MessageContext context = validateAndExtractContext(
                sender,
                receiver,
                relatedType,
                relatedId
        );

        // 메시지 생성
        Message message = new Message(
                context.project,
                context.pm,
                context.freelancer,
                sender,
                relatedType,
                relatedId,
                content
        );

        Message savedMessage = messageRepository.save(message);

        // 수신자에게 알림 전송
        notificationService.create(
                receiver,
                NotificationType.MESSAGE_RECEIVED,
                "새 메시지가 도착했습니다",
                String.format("%s님이 '%s' 프로젝트에 메시지를 보냈습니다.", sender.getNickname(), context.project.getTitle()),
                "MESSAGE",
                savedMessage.getId()
        );

        return savedMessage;
    }

    /**
     * 메시지 ID로 조회
     *
     * @param id 메시지 ID
     * @return 메시지
     */
    public Message findById(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 메시지입니다."));
    }

    /**
     * 사용자의 메시지 목록 조회
     *
     * @param member 사용자
     * @return 메시지 목록
     */
    public List<Message> findByMember(Member member) {
        // 프리랜서인지 확인
        var freelancerOpt = freelancerRepository.findByMemberId(member.getId());

        if (freelancerOpt.isPresent()) {
            // 프리랜서가 참여한 메시지 조회
            return messageRepository.findByFreelancerOrderByCreateDateDesc(freelancerOpt.get());
        } else {
            // PM이 참여한 메시지 조회
            return messageRepository.findByPmOrderByCreateDateDesc(member);
        }
    }

    /**
     * 특정 프로젝트+프리랜서 간 대화 히스토리 조회 (채팅 모달용)
     *
     * @param currentUser  현재 사용자
     * @param projectId    프로젝트 ID
     * @param freelancerId 프리랜서 ID
     * @param limit        조회할 메시지 개수
     * @return 메시지 목록 (날짜 오름차순)
     */
    public List<Message> findConversation(
            Member currentUser,
            Long projectId,
            Long freelancerId,
            int limit
    ) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // 프리랜서 조회
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프리랜서입니다."));

        Member pm = project.getManager();

        // 현재 사용자가 PM 또는 프리랜서인지 확인
        boolean isParticipant = currentUser.getId().equals(pm.getId()) ||
                                currentUser.getId().equals(freelancer.getMember().getId());

        if (!isParticipant) {
            throw new ServiceException("403-1", "대화 참여자만 조회할 수 있습니다.");
        }

        // PM과 프리랜서 간의 모든 메시지 조회 (날짜 내림차순)
        List<Message> messages = messageRepository.findByPmAndFreelancerOrderByCreateDateDesc(pm, freelancer);

        // limit 적용 및 날짜 오름차순으로 변경
        return messages.stream()
                .limit(limit)
                .sorted((m1, m2) -> m1.getCreateDate().compareTo(m2.getCreateDate()))
                .toList();
    }

    /**
     * 특정 대화의 메시지 목록 조회
     *
     * @param pm          PM
     * @param freelancer  프리랜서
     * @param relatedType 연관 타입
     * @param relatedId   연관 ID
     * @return 메시지 목록
     */
    public List<Message> findConversation(
            Member pm,
            Freelancer freelancer,
            RelatedType relatedType,
            Long relatedId
    ) {
        return messageRepository.findByPmAndFreelancerAndRelatedTypeAndRelatedIdOrderByCreateDateDesc(
                pm,
                freelancer,
                relatedType,
                relatedId
        );
    }

    /**
     * 읽지 않은 메시지 목록 조회
     *
     * @param member 사용자
     * @return 읽지 않은 메시지 목록
     */
    public List<Message> findUnreadMessages(Member member) {
        return messageRepository.findUnreadMessagesByReceiver(member.getId());
    }

    /**
     * 메시지 읽음 처리
     *
     * @param message 메시지
     * @param reader  읽는 사용자
     */
    @Transactional
    public void markAsRead(Message message, Member reader) {
        // 수신자 확인
        if (!message.isReceiver(reader)) {
            throw new ServiceException("403-1", "수신자만 읽음 처리할 수 있습니다.");
        }

        // 이미 읽음 처리된 경우 무시
        if (!message.isRead()) {
            message.markAsRead();
        }
    }

    /**
     * 대화방의 모든 읽지 않은 메시지 읽음 처리
     *
     * @param currentUser  현재 사용자
     * @param projectId    프로젝트 ID
     * @param freelancerId 프리랜서 ID
     */
    @Transactional
    public void markConversationAsRead(Member currentUser, Long projectId, Long freelancerId) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // 프리랜서 조회
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프리랜서입니다."));

        Member pm = project.getManager();

        // 현재 사용자가 PM 또는 프리랜서인지 확인
        boolean isParticipant = currentUser.getId().equals(pm.getId()) ||
                                currentUser.getId().equals(freelancer.getMember().getId());

        if (!isParticipant) {
            throw new ServiceException("403-1", "대화 참여자만 읽음 처리할 수 있습니다.");
        }

        // PM과 프리랜서 간의 모든 읽지 않은 메시지 조회
        List<Message> messages = messageRepository.findByPmAndFreelancerOrderByCreateDateDesc(pm, freelancer);

        // 현재 사용자가 수신자인 읽지 않은 메시지만 읽음 처리
        messages.stream()
                .filter(msg -> !msg.isRead() && msg.isReceiver(currentUser))
                .forEach(Message::markAsRead);
    }

    /**
     * 연관 항목 검증 및 컨텍스트 추출
     */
    private MessageContext validateAndExtractContext(
            Member sender,
            Member receiver,
            RelatedType relatedType,
            Long relatedId
    ) {
        return switch (relatedType) {
            case SUBMISSION -> validateSubmission(sender, receiver, relatedId);
            case PROPOSAL -> validateProposal(sender, receiver, relatedId);
            case PROJECT -> validateProject(sender, receiver, relatedId);
        };
    }

    /**
     * 지원 관련 메시지 검증
     */
    private MessageContext validateSubmission(Member sender, Member receiver, Long submissionId) {
        ProjectSubmission submission = projectSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 지원입니다."));

        // 발신자/수신자가 지원의 PM 또는 프리랜서인지 확인
        boolean senderIsParticipant = sender.getId().equals(submission.getProject().getManager().getId()) ||
                                      sender.getId().equals(submission.getFreelancer().getMember().getId());
        boolean receiverIsParticipant = receiver.getId().equals(submission.getProject().getManager().getId()) ||
                                        receiver.getId().equals(submission.getFreelancer().getMember().getId());

        if (!senderIsParticipant || !receiverIsParticipant) {
            throw new ServiceException("403-1", "지원 관련 사용자만 메시지를 보낼 수 있습니다.");
        }

        return new MessageContext(
                submission.getProject(),
                submission.getProject().getManager(),
                submission.getFreelancer()
        );
    }

    /**
     * 제안 관련 메시지 검증
     */
    private MessageContext validateProposal(Member sender, Member receiver, Long proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 제안입니다."));

        // 발신자/수신자가 제안의 PM 또는 프리랜서인지 확인
        boolean senderIsParticipant = sender.getId().equals(proposal.getPm().getId()) ||
                                      sender.getId().equals(proposal.getFreelancer().getMember().getId());
        boolean receiverIsParticipant = receiver.getId().equals(proposal.getPm().getId()) ||
                                        receiver.getId().equals(proposal.getFreelancer().getMember().getId());

        if (!senderIsParticipant || !receiverIsParticipant) {
            throw new ServiceException("403-1", "제안 관련 사용자만 메시지를 보낼 수 있습니다.");
        }

        return new MessageContext(
                proposal.getProject(),
                proposal.getPm(),
                proposal.getFreelancer()
        );
    }

    /**
     * 프로젝트 일반 문의 검증
     */
    private MessageContext validateProject(Member sender, Member receiver, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // TODO: 프로젝트 PM 확인 로직 추가 필요
        // 임시: sender를 PM으로, receiver를 프리랜서로 가정
        Freelancer freelancer = freelancerRepository.findById(receiver.getId())
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프리랜서입니다."));

        return new MessageContext(project, sender, freelancer);
    }

    /**
     * 대화방 목록 조회
     * 현재 사용자가 참여한 모든 대화방을 최신 메시지 순으로 정렬
     *
     * @param member 현재 사용자
     * @return 대화방 목록
     */
    public List<ConversationDto> findConversations(Member member) {
        // 사용자가 참여한 모든 메시지 조회
        List<Message> allMessages = findByMember(member);

        if (allMessages.isEmpty()) {
            return new ArrayList<>();
        }

        // (projectId, pmId, freelancerId) 조합으로 그룹핑
        Map<String, List<Message>> conversationMap = allMessages.stream()
                .collect(Collectors.groupingBy(msg ->
                    msg.getProject().getId() + "_" +
                    msg.getPm().getId() + "_" +
                    msg.getFreelancer().getId()
                ));

        // 각 대화방의 메시지를 최신순으로 정렬하고 ConversationDto 생성
        List<ConversationDto> conversations = conversationMap.values().stream()
                .map(messages -> {
                    // 메시지를 최신순으로 정렬
                    messages.sort((m1, m2) -> m2.getCreateDate().compareTo(m1.getCreateDate()));
                    return new ConversationDto(messages, member.getId());
                })
                .collect(Collectors.toList());

        // 최신 메시지 시간 기준으로 정렬
        conversations.sort((c1, c2) -> c2.getLastMessageAt().compareTo(c1.getLastMessageAt()));

        return conversations;
    }

    /**
     * 메시지 컨텍스트 (내부 사용)
     */
    private record MessageContext(
            Project project,
            Member pm,
            Freelancer freelancer
    ) {}
}
