package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {

    // 프로젝트별 파일 조회 (업로드 날짜 내림차순)
    List<ProjectFile> findByProjectIdOrderByUploadDateDesc(Long projectId);

    // 원본 파일명으로 중복 검사
    boolean existsByProjectIdAndOriginalName(Long projectId, String originalName);

    // 프로젝트의 총 파일 크기
    @Query("SELECT COALESCE(SUM(pf.fileSize), 0) FROM ProjectFile pf WHERE pf.projectId = :projectId")
    Long getTotalFileSizeByProjectId(@Param("projectId") Long projectId);

    // 프로젝트별 파일 일괄 삭제
    void deleteByProjectId(Long projectId);
}