package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.ProjectFavorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ProjectFavoriteRepository extends JpaRepository<ProjectFavorite, Long> {

    // 사용자별 즐겨찾기 조회 (페이징)
    Page<ProjectFavorite> findByUserIdOrderByCreateDateDesc(Long userId, Pageable pageable);

    // 사용자별 즐겨찾기 조회(페이징 없음)
    List<ProjectFavorite> findByUserIdOrderByCreateDateDesc(Long userId);

    // 특정 즐겨찾기 조회
    Optional<ProjectFavorite> findByUserIdAndProjectId(Long userId, Long projectId);

    // 사용자 즐겨찾기 수
    long countByUserId(Long userId);

    // 프로젝트 즐겨찾기 수
    long countByProjectId(Long projectId);

    // 즐겨찾기 존재 여부 확인
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);

    // 특정 사용자의 즐겨찾기 삭제
    @Modifying
    @Transactional
    void deleteByUserIdAndProjectId(Long userId, Long projectId);

    // 사용자별 전체 삭제
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    // 프로젝트의 모든 즐겨찾기 삭제
    @Modifying
    @Transactional
    void deleteByProjectId(Long projectId);
}