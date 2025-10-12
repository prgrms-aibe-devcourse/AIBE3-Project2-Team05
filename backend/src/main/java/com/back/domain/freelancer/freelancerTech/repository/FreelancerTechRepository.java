package com.back.domain.freelancer.freelancerTech.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.tech.tech.entity.Tech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 임시 Repository - 매칭 시스템 개발/테스트용
 * TODO: [FreelancerTech 담당자] - 정식 Repository로 교체 필요
 */
public interface FreelancerTechRepository extends JpaRepository<FreelancerTech, Long> {

    /**
     * 프리랜서의 보유 기술 목록 조회
     */
    List<FreelancerTech> findByFreelancer(Freelancer freelancer);

    /**
     * 특정 기술을 보유한 프리랜서 조회
     */
    List<FreelancerTech> findByTech(Tech tech);

    /**
     * 특정 기술과 숙련도를 보유한 프리랜서 조회
     */
    List<FreelancerTech> findByTechAndProficiency(Tech tech, String proficiency);

    /**
     * 프리랜서의 기술 이름 목록 조회
     */
    @Query("SELECT ft.techName FROM FreelancerTech ft WHERE ft.freelancer.id = :freelancerId")
    List<String> findTechNamesByFreelancerId(@Param("freelancerId") Long freelancerId);

    /**
     * 특정 기술 목록을 보유한 프리랜서 ID 조회
     */
    @Query("SELECT DISTINCT ft.freelancer.id FROM FreelancerTech ft WHERE ft.techName IN :techNames")
    List<Long> findFreelancerIdsByTechNames(@Param("techNames") List<String> techNames);
}
