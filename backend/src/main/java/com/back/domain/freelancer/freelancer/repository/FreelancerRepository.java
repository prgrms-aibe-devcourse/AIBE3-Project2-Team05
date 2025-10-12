package com.back.domain.freelancer.freelancer.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * ⚠️ 임시 Repository - 매칭 시스템 개발/테스트용
 * TODO: [Freelancer 담당자] - 정식 Repository로 교체 필요
 */
public interface FreelancerRepository extends JpaRepository<Freelancer, Long> {

    /**
     * Member ID로 Freelancer 조회
     */
    Optional<Freelancer> findByMember(Member member);

    /**
     * 작업 가능한 프리랜서 목록 조회
     */
    List<Freelancer> findByAvailableTrue();
}
