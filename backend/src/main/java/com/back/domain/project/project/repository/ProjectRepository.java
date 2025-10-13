package com.back.domain.project.project.repository;

import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 임시 Repository - 매칭 시스템 개발/테스트용
 * TODO: [Project 담당자] - 정식 Repository로 교체 필요
 */
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * PM의 프로젝트 목록 조회
     */
    List<Project> findByPmOrderByCreateDateDesc(Member pm);

    /**
     * 특정 상태의 프로젝트 조회
     */
    List<Project> findByStatusOrderByCreateDateDesc(String status);

    /**
     * Member가 PM인지 확인
     */
    boolean existsByPm(Member pm);

    /**
     * 전체 프로젝트 목록 조회 (최신순)
     */
    List<Project> findAllByOrderByCreateDateDesc();
}
