package com.back.domain.freelancer.career.repository;

import com.back.domain.freelancer.career.entity.Career;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 임시 Repository - 매칭 시스템 개발/테스트용
 * TODO: [Career 담당자] - 정식 Repository로 교체 필요
 */
public interface CareerRepository extends JpaRepository<Career, Long> {

    /**
     * 프리랜서의 경력 목록 조회 (최신순)
     */
    List<Career> findByFreelancerOrderByStartDateDesc(Freelancer freelancer);

    /**
     * 프리랜서의 현재 재직 중인 경력 조회
     */
    List<Career> findByFreelancerAndIsCurrentTrue(Freelancer freelancer);

    /**
     * 프리랜서의 경력 개수 조회
     */
    long countByFreelancer(Freelancer freelancer);

    /**
     * 프리랜서의 총 경력 연수 계산 (중복 제거)
     */
    @Query(value = "SELECT COALESCE(SUM(YEAR(COALESCE(end_date, CURRENT_DATE)) - YEAR(start_date)), 0) " +
                   "FROM career WHERE freelancer_id = :freelancerId",
           nativeQuery = true)
    Integer calculateTotalYears(@Param("freelancerId") Long freelancerId);
}
