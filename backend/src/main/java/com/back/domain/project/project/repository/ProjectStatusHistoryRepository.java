package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.ProjectStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProjectStatusHistoryRepository extends JpaRepository<ProjectStatusHistory, Long> {

    // 프로젝트별 상태 이력 조회 (최신순)
    List<ProjectStatusHistory> findByProjectIdOrderByChangeDateDesc(Long projectId);

    // 프로젝트의 모든 상태 이력 삭제
    @Modifying
    @Transactional
    void deleteByProjectId(Long projectId);
}