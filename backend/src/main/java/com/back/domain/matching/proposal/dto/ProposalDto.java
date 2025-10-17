package com.back.domain.matching.proposal.dto;

import com.back.domain.matching.proposal.entity.Proposal;
import com.back.domain.matching.proposal.entity.ProposalStatus;

import java.time.LocalDateTime;

/**
 * 프로젝트 제안 응답 DTO
 */
public record ProposalDto(
        Long id,
        Long projectId,
        String projectTitle,
        Long pmId,
        String pmName,
        Long freelancerId,
        Long freelancerMemberId,
        String freelancerName,
        String message,
        ProposalStatus status,
        String responseMessage,
        String rejectionReason,
        LocalDateTime responseDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Entity를 DTO로 변환
     */
    public ProposalDto(Proposal proposal) {
        this(
                proposal.getId(),
                proposal.getProject().getId(),
                proposal.getProject().getTitle(),
                proposal.getPm().getId(),
                proposal.getPm().getNickname(),
                proposal.getFreelancer().getId(),
                proposal.getFreelancer().getMember().getId(),
                proposal.getFreelancer().getMemberNickname(),
                proposal.getMessage(),
                proposal.getStatus(),
                proposal.getResponseMessage(),
                proposal.getRejectionReason(),
                proposal.getResponseDate(),
                proposal.getCreateDate(),
                proposal.getModifyDate()
        );
    }
}
