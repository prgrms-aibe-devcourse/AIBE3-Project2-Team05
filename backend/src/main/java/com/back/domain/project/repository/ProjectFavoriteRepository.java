package com.back.domain.project.repository;

import com.back.domain.project.entity.ProjectFavorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectFavoriteRepository extends JpaRepository<ProjectFavorite, Long> {

    // 사용자의 즐겨찾기 목록 조회 (페이징)
    Page<ProjectFavorite> findByUserIdOrderByCreateDateDesc(Long userId, Pageable pageable);

    // 사용자의 즐겨찾기 목록 조회 (전체)
    List<ProjectFavorite> findByUserIdOrderByCreateDateDesc(Long userId);

    // 특정 사용자의 특정 프로젝트 즐겨찾기 조회
    Optional<ProjectFavorite> findByUserIdAndProjectId(Long userId, Long projectId);

    // 프로젝트별 즐겨찾기 수 조회
    @Query("SELECT COUNT(pf) FROM ProjectFavorite pf WHERE pf.projectId = :projectId")
    long countByProjectId(@Param("projectId") Long projectId);

    // 사용자가 즐겨찾기한 프로젝트 ID 목록 조회
    @Query("SELECT pf.projectId FROM ProjectFavorite pf WHERE pf.userId = :userId")
    List<Long> findProjectIdsByUserId(@Param("userId") Long userId);
}
