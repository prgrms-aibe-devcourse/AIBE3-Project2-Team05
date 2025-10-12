package com.back.domain.project.projectTech.repository;

import com.back.domain.project.project.entity.Project;
import com.back.domain.project.projectTech.entity.ProjectTech;
import com.back.domain.tech.tech.entity.Tech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * ⚠️ 임시 Repository - 매칭 시스템 개발/테스트용
 * TODO: [ProjectTech 담당자] - 정식 Repository로 교체 필요
 */
public interface ProjectTechRepository extends JpaRepository<ProjectTech, Long> {

    /**
     * 프로젝트의 요구 기술 목록 조회
     */
    List<ProjectTech> findByProject(Project project);

    /**
     * 프로젝트의 필수 기술만 조회
     */
    List<ProjectTech> findByProjectAndRequiredTrue(Project project);

    /**
     * 특정 기술을 요구하는 프로젝트 조회
     */
    List<ProjectTech> findByTech(Tech tech);

    /**
     * 프로젝트의 기술 이름 목록 조회
     */
    @Query("SELECT pt.techName FROM ProjectTech pt WHERE pt.project.id = :projectId")
    List<String> findTechNamesByProjectId(@Param("projectId") Long projectId);
}
