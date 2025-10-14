package com.back.domain.matching.proposal.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.matching.proposal.entity.Proposal;
import com.back.domain.matching.proposal.entity.ProposalStatus;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 프로젝트 제안 Repository
 */
public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    /**
     * PM이 특정 프리랜서에게 특정 프로젝트로 제안했는지 확인
     * 중복 제안 방지를 위해 사용
     *
     * @param project    프로젝트
     * @param freelancer 프리랜서
     * @return 제안 여부
     */
    boolean existsByProjectAndFreelancer(Project project, Freelancer freelancer);

    /**
     * PM이 보낸 제안 목록 조회 (최신순)
     *
     * @param pm PM
     * @return 제안 목록
     */
    List<Proposal> findByPmOrderByCreateDateDesc(Member pm);

    /**
     * PM의 특정 상태 제안 목록 조회
     *
     * @param pm     PM
     * @param status 제안 상태
     * @return 제안 목록
     */
    List<Proposal> findByPmAndStatusOrderByCreateDateDesc(Member pm, ProposalStatus status);

    /**
     * 프리랜서가 받은 제안 목록 조회 (최신순)
     *
     * @param freelancer 프리랜서
     * @return 제안 목록
     */
    List<Proposal> findByFreelancerOrderByCreateDateDesc(Freelancer freelancer);

    /**
     * 프리랜서의 특정 상태 제안 목록 조회
     *
     * @param freelancer 프리랜서
     * @param status     제안 상태
     * @return 제안 목록
     */
    List<Proposal> findByFreelancerAndStatusOrderByCreateDateDesc(
            Freelancer freelancer,
            ProposalStatus status
    );

    /**
     * 프로젝트의 제안 목록 조회 (최신순)
     *
     * @param project 프로젝트
     * @return 제안 목록
     */
    List<Proposal> findByProjectOrderByCreateDateDesc(Project project);

    /**
     * 프로젝트의 특정 상태 제안 목록 조회
     *
     * @param project 프로젝트
     * @param status  제안 상태
     * @return 제안 목록
     */
    List<Proposal> findByProjectAndStatusOrderByCreateDateDesc(
            Project project,
            ProposalStatus status
    );

    /**
     * 특정 프로젝트와 프리랜서의 제안 조회
     *
     * @param project    프로젝트
     * @param freelancer 프리랜서
     * @return 제안 정보
     */
    Optional<Proposal> findByProjectAndFreelancer(Project project, Freelancer freelancer);

    /**
     * 프로젝트의 제안 수 조회
     *
     * @param project 프로젝트
     * @return 제안 수
     */
    long countByProject(Project project);

    /**
     * 프리랜서가 받은 제안 수 조회
     *
     * @param freelancer 프리랜서
     * @return 제안 수
     */
    long countByFreelancer(Freelancer freelancer);

    /**
     * 프리랜서가 받은 대기중인 제안 수 조회
     *
     * @param freelancer 프리랜서
     * @return 대기중인 제안 수
     */
    long countByFreelancerAndStatus(Freelancer freelancer, ProposalStatus status);
}
