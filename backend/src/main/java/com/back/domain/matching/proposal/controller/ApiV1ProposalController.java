package com.back.domain.matching.proposal.controller;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.matching.proposal.dto.ProposalAcceptReqBody;
import com.back.domain.matching.proposal.dto.ProposalCreateReqBody;
import com.back.domain.matching.proposal.dto.ProposalDto;
import com.back.domain.matching.proposal.dto.ProposalRejectReqBody;
import com.back.domain.matching.proposal.entity.Proposal;
import com.back.domain.matching.proposal.service.ProposalService;
import com.back.domain.member.member.entity.Member;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 프로젝트 제안 API Controller
 */
@RestController
@RequestMapping("/api/v1/proposals")
@RequiredArgsConstructor
public class ApiV1ProposalController {

    private final ProposalService proposalService;

    /**
     * 프로젝트 제안 생성 (PM 전용)
     *
     * @param user    현재 로그인한 사용자 (PM)
     * @param reqBody 제안 정보
     * @return 생성된 제안 정보
     */
    @PostMapping
    @Transactional
    public RsData<ProposalDto> create(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody ProposalCreateReqBody reqBody
    ) {
        Member pm = user.getMember();

        Proposal proposal = proposalService.create(
                pm,
                reqBody.projectId(),
                reqBody.freelancerId(),
                reqBody.message()
        );

        return new RsData<>(
                "201-1",
                "제안이 전송되었습니다.",
                new ProposalDto(proposal)
        );
    }

    /**
     * 제안 목록 조회
     * - PM: 내가 보낸 제안 목록
     * - 프리랜서: 내가 받은 제안 목록
     *
     * @param user 현재 로그인한 사용자
     * @return 제안 목록
     */
    @GetMapping
    public RsData<List<ProposalDto>> getProposals(
            @AuthenticationPrincipal SecurityUser user
    ) {
        List<Proposal> proposals;

        // TODO: 프리랜서/PM 구분 로직 구현 필요
        // if (user.isFreelancer()) {
        //     Freelancer freelancer = user.getFreelancer();
        //     proposals = proposalService.findByFreelancer(freelancer);
        // } else {
        //     Member pm = user.getMember();
        //     proposals = proposalService.findByPm(pm);
        // }

        // 임시: PM으로 가정
        Member pm = user.getMember();
        proposals = proposalService.findByPm(pm);

        List<ProposalDto> dtos = proposals.stream()
                .map(ProposalDto::new)
                .toList();

        return new RsData<>(
                "200-1",
                "제안 목록이 조회되었습니다.",
                dtos
        );
    }

    /**
     * 제안 상세 조회
     *
     * @param user 현재 로그인한 사용자
     * @param id   제안 ID
     * @return 제안 상세 정보
     */
    @GetMapping("/{id}")
    public RsData<ProposalDto> getProposal(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id
    ) {
        Proposal proposal = proposalService.findById(id);

        // TODO: 권한 확인 (PM 본인 또는 제안받은 프리랜서)

        return new RsData<>(
                "200-1",
                "제안 정보가 조회되었습니다.",
                new ProposalDto(proposal)
        );
    }

    /**
     * 제안 수락 (프리랜서 전용)
     *
     * @param user    현재 로그인한 사용자 (프리랜서)
     * @param id      제안 ID
     * @param reqBody 수락 메시지
     * @return 성공 메시지
     */
    @PutMapping("/{id}/accept")
    @Transactional
    public RsData<Void> accept(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id,
            @RequestBody ProposalAcceptReqBody reqBody
    ) {
        // TODO: user.getFreelancer() 구현 필요
        Freelancer freelancer = user.getFreelancer();
        Proposal proposal = proposalService.findById(id);

        proposalService.accept(proposal, freelancer, reqBody.responseMessage());

        return new RsData<>(
                "200-1",
                "제안을 수락했습니다."
        );
    }

    /**
     * 제안 거절 (프리랜서 전용)
     *
     * @param user    현재 로그인한 사용자 (프리랜서)
     * @param id      제안 ID
     * @param reqBody 거절 정보 (메시지, 사유)
     * @return 성공 메시지
     */
    @PutMapping("/{id}/reject")
    @Transactional
    public RsData<Void> reject(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id,
            @Valid @RequestBody ProposalRejectReqBody reqBody
    ) {
        Freelancer freelancer = user.getFreelancer();
        Proposal proposal = proposalService.findById(id);

        proposalService.reject(
                proposal,
                freelancer,
                reqBody.responseMessage(),
                reqBody.rejectionReason()
        );

        return new RsData<>(
                "200-1",
                "제안을 거절했습니다."
        );
    }

    /**
     * 제안 취소 (PM 전용)
     *
     * @param user 현재 로그인한 사용자 (PM)
     * @param id   제안 ID
     * @return 성공 메시지
     */
    @DeleteMapping("/{id}")
    @Transactional
    public RsData<Void> cancel(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id
    ) {
        Member pm = user.getMember();
        Proposal proposal = proposalService.findById(id);

        proposalService.cancel(proposal, pm);

        return new RsData<>(
                "200-1",
                "제안이 취소되었습니다."
        );
    }
}
