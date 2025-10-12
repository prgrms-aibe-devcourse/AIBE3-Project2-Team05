package com.back.domain.freelancer.portfolio.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 임시 Repository - 매칭 시스템 개발/테스트용
 * TODO: [Portfolio 담당자] - 정식 Repository로 교체 필요
 */
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    /**
     * 프리랜서의 포트폴리오 목록 조회 (최신순)
     */
    List<Portfolio> findByFreelancerOrderByEndDateDesc(Freelancer freelancer);

    /**
     * 프리랜서의 포트폴리오 개수 조회
     */
    long countByFreelancer(Freelancer freelancer);
}
