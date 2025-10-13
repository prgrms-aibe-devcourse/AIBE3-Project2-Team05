package com.back.domain.project.repository;

import com.back.domain.project.entity.ProjectTech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProjectTechRepository extends JpaRepository<ProjectTech, Long> {

    // 프로젝트별 기술스택 조회 (생성일순)
    List<ProjectTech> findByProject_IdOrderByCreateDate(Long projectId);

    // 기술스택 존재 여부 확인
    boolean existsByProject_IdAndTechName(Long projectId, String techName);

    // 삭제 메서드들
    @Modifying
    @Transactional
    void deleteByProject_IdAndTechName(Long projectId, String techName);

    @Modifying
    @Transactional
    void deleteByProject_Id(Long projectId);
}