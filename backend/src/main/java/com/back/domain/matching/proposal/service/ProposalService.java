package com.back.domain.matching.proposal.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.matching.proposal.entity.Proposal;
import com.back.domain.matching.proposal.entity.ProposalStatus;
import com.back.domain.matching.proposal.repository.ProposalRepository;
import com.back.domain.member.member.entity.Member;
import com.back.domain.notification.notification.entity.NotificationType;
import com.back.domain.notification.notification.service.NotificationService;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 프로젝트 제안 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final ProjectRepository projectRepository;
    private final FreelancerRepository freelancerRepository;
    private final NotificationService notificationService;

    /**
     * 프로젝트 제안 생성 (PM 전용)
     *
     * @param pm           제안하는 PM
     * @param projectId    프로젝트 ID
     * @param freelancerId 프리랜서 ID
     * @param message      제안 메시지
     * @return 생성된 제안
     */
    @Transactional
    public Proposal create(
            Member pm,
            Long projectId,
            Long freelancerId,
            String message
    ) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // 프로젝트 소유자 확인
        // TODO: project.isOwner(pm) 구현 필요
        // if (!project.isOwner(pm)) {
        //     throw new ServiceException("403-1", "본인의 프로젝트에만 제안할 수 있습니다.");
        // }

        // 프리랜서 조회
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프리랜서입니다."));

        // 중복 제안 확인
        if (proposalRepository.existsByProjectAndFreelancer(project, freelancer)) {
            throw new ServiceException("409-1", "이미 제안한 프리랜서입니다.");
        }

        // 제안 생성
        Proposal proposal = new Proposal(
                project,
                pm,
                freelancer,
                message
        );

        Proposal savedProposal = proposalRepository.save(proposal);

        // 프리랜서에게 알림 전송
        notificationService.create(
                freelancer.getMember(),
                NotificationType.PROPOSAL_RECEIVED,
                "새 제안이 도착했습니다",
                String.format("%s님이 '%s' 프로젝트에 대한 제안을 보냈습니다.", pm.getNickname(), project.getTitle()),
                "PROPOSAL",
                savedProposal.getId()
        );

        return savedProposal;
    }

    /**
     * 제안 ID로 조회
     *
     * @param id 제안 ID
     * @return 제안
     */
    public Proposal findById(Long id) {
        return proposalRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 제안입니다."));
    }

    /**
     * PM이 보낸 제안 목록 조회
     *
     * @param pm PM
     * @return 제안 목록
     */
    public List<Proposal> findByPm(Member pm) {
        return proposalRepository.findByPmOrderByCreateDateDesc(pm);
    }

    /**
     * PM의 특정 상태 제안 목록 조회
     *
     * @param pm     PM
     * @param status 제안 상태
     * @return 제안 목록
     */
    public List<Proposal> findByPmAndStatus(Member pm, ProposalStatus status) {
        return proposalRepository.findByPmAndStatusOrderByCreateDateDesc(pm, status);
    }

    /**
     * 프리랜서가 받은 제안 목록 조회
     *
     * @param freelancer 프리랜서
     * @return 제안 목록
     */
    public List<Proposal> findByFreelancer(Freelancer freelancer) {
        return proposalRepository.findByFreelancerOrderByCreateDateDesc(freelancer);
    }

    /**
     * 프리랜서의 특정 상태 제안 목록 조회
     *
     * @param freelancer 프리랜서
     * @param status     제안 상태
     * @return 제안 목록
     */
    public List<Proposal> findByFreelancerAndStatus(Freelancer freelancer, ProposalStatus status) {
        return proposalRepository.findByFreelancerAndStatusOrderByCreateDateDesc(freelancer, status);
    }

    /**
     * 프로젝트의 제안 목록 조회
     *
     * @param projectId 프로젝트 ID
     * @return 제안 목록
     */
    public List<Proposal> findByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        return proposalRepository.findByProjectOrderByCreateDateDesc(project);
    }

    /**
     * 제안 수락 (프리랜서 전용)
     *
     * @param proposal        제안
     * @param freelancer      프리랜서 (권한 확인용)
     * @param responseMessage 수락 메시지
     */
    @Transactional
    public void accept(Proposal proposal, Freelancer freelancer, String responseMessage) {
        // 권한 확인
        if (!proposal.isTargetFreelancer(freelancer)) {
            throw new ServiceException("403-1", "본인에게 온 제안만 수락할 수 있습니다.");
        }

        // 수락 (PENDING 상태가 아니면 IllegalStateException 발생)
        proposal.accept(responseMessage);

        // PM에게 알림 전송
        notificationService.create(
                proposal.getPm(),
                NotificationType.PROPOSAL_ACCEPTED,
                "제안이 수락되었습니다",
                String.format("%s님이 '%s' 프로젝트 제안을 수락했습니다.", freelancer.getName(), proposal.getProject().getTitle()),
                "PROPOSAL",
                proposal.getId()
        );
    }

    /**
     * 제안 거절 (프리랜서 전용)
     *
     * @param proposal        제안
     * @param freelancer      프리랜서 (권한 확인용)
     * @param responseMessage 거절 메시지
     * @param rejectionReason 거절 사유
     */
    @Transactional
    public void reject(
            Proposal proposal,
            Freelancer freelancer,
            String responseMessage,
            String rejectionReason
    ) {
        // 권한 확인
        if (!proposal.isTargetFreelancer(freelancer)) {
            throw new ServiceException("403-1", "본인에게 온 제안만 거절할 수 있습니다.");
        }

        // 거절 (PENDING 상태가 아니면 IllegalStateException 발생)
        proposal.reject(responseMessage, rejectionReason);

        // PM에게 알림 전송
        notificationService.create(
                proposal.getPm(),
                NotificationType.PROPOSAL_REJECTED,
                "제안이 거절되었습니다",
                String.format("%s님이 '%s' 프로젝트 제안을 거절했습니다.", freelancer.getName(), proposal.getProject().getTitle()),
                "PROPOSAL",
                proposal.getId()
        );
    }

    /**
     * 제안 취소 (PM 전용)
     *
     * @param proposal 제안
     * @param pm       PM (권한 확인용)
     */
    @Transactional
    public void cancel(Proposal proposal, Member pm) {
        // 권한 확인
        if (!proposal.isPm(pm)) {
            throw new ServiceException("403-1", "본인이 보낸 제안만 취소할 수 있습니다.");
        }

        // 취소 (PENDING 상태가 아니면 IllegalStateException 발생)
        proposal.cancel();
    }

    /**
     * 프리랜서가 받은 대기중인 제안 수 조회
     *
     * @param freelancer 프리랜서
     * @return 대기중인 제안 수
     */
    public long countPendingProposals(Freelancer freelancer) {
        return proposalRepository.countByFreelancerAndStatus(freelancer, ProposalStatus.PENDING);
    }
}
