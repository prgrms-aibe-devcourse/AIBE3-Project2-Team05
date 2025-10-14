package com.back.domain.matching.proposal.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.entity.Project;
import com.back.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 프로젝트 제안 Entity
 * PM이 프리랜서에게 프로젝트 참여를 제안하는 정보를 저장
 */
@Entity
@Table(
    name = "proposal",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_project_freelancer_proposal",
            columnNames = {"project_id", "freelancer_id"}
        )
    },
    indexes = {
        @Index(name = "idx_project_status", columnList = "project_id, status"),
        @Index(name = "idx_freelancer_status", columnList = "freelancer_id, status"),
        @Index(name = "idx_pm", columnList = "pm_id")
    }
)
@Getter
@NoArgsConstructor
public class Proposal extends BaseEntity {

    /**
     * 제안 대상 프로젝트
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * 제안한 프로젝트 매니저 (PM)
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id", nullable = false)
    private Member pm;

    /**
     * 제안받은 프리랜서
     * LAZY 로딩으로 성능 최적화
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_member_id", nullable = false)
    private Freelancer freelancer;

    /**
     * 제안 메시지
     * PM이 프리랜서에게 보내는 제안 내용
     */
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    /**
     * 제안 상태 (PENDING, ACCEPTED, REJECTED, CANCELLED)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProposalStatus status = ProposalStatus.PENDING;

    /**
     * 프리랜서의 응답 메시지
     * 수락/거절 시 프리랜서가 남기는 메시지
     */
    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;

    /**
     * 거절 사유
     * 프리랜서가 제안을 거절할 때 선택하는 사유
     */
    @Column(name = "rejection_reason")
    private String rejectionReason;

    /**
     * 응답 일자
     * 프리랜서가 제안에 응답(수락/거절)한 일시
     */
    @Column(name = "responded_date")
    private LocalDateTime responseDate;

    /**
     * 생성자 - 프로젝트 제안 생성
     *
     * @param project    제안할 프로젝트
     * @param pm         제안하는 PM
     * @param freelancer 제안받을 프리랜서
     * @param message    제안 메시지
     */
    public Proposal(
            Project project,
            Member pm,
            Freelancer freelancer,
            String message
    ) {
        this.project = project;
        this.pm = pm;
        this.freelancer = freelancer;
        this.message = message;
        this.status = ProposalStatus.PENDING;
    }

    /**
     * 제안 수락
     * 프리랜서가 제안을 수락할 때 사용
     *
     * @param responseMessage 수락 메시지
     */
    public void accept(String responseMessage) {
        if (this.status != ProposalStatus.PENDING) {
            throw new IllegalStateException("대기 중인 제안만 수락할 수 있습니다.");
        }
        this.status = ProposalStatus.ACCEPTED;
        this.responseMessage = responseMessage;
        this.responseDate = LocalDateTime.now();
    }

    /**
     * 제안 거절
     * 프리랜서가 제안을 거절할 때 사용
     *
     * @param responseMessage  거절 메시지
     * @param rejectionReason  거절 사유
     */
    public void reject(String responseMessage, String rejectionReason) {
        if (this.status != ProposalStatus.PENDING) {
            throw new IllegalStateException("대기 중인 제안만 거절할 수 있습니다.");
        }
        this.status = ProposalStatus.REJECTED;
        this.responseMessage = responseMessage;
        this.rejectionReason = rejectionReason;
        this.responseDate = LocalDateTime.now();
    }

    /**
     * 제안 취소
     * PM이 제안을 취소할 때 사용
     */
    public void cancel() {
        if (this.status != ProposalStatus.PENDING) {
            throw new IllegalStateException("대기 중인 제안만 취소할 수 있습니다.");
        }
        this.status = ProposalStatus.CANCELLED;
    }

    /**
     * PM 권한 확인
     * 제안한 PM 본인만 취소할 수 있는지 확인
     *
     * @param member 확인할 멤버
     * @return PM 본인이면 true
     */
    public boolean isPm(Member member) {
        return this.pm.getId().equals(member.getId());
    }

    /**
     * 프리랜서 권한 확인
     * 제안받은 프리랜서 본인만 수락/거절할 수 있는지 확인
     *
     * @param freelancer 확인할 프리랜서
     * @return 본인이면 true
     */
    public boolean isTargetFreelancer(Freelancer freelancer) {
        return this.freelancer.getId().equals(freelancer.getId());
    }

    /**
     * 취소 가능 여부 확인
     *
     * @return 취소 가능하면 true (PENDING 상태)
     */
    public boolean isCancellable() {
        return this.status == ProposalStatus.PENDING;
    }
}
