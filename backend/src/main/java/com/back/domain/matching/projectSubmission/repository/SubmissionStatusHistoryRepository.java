package com.back.domain.matching.projectSubmission.repository;

import com.back.domain.matching.projectSubmission.entity.ProjectSubmission;
import com.back.domain.matching.projectSubmission.entity.SubmissionStatusHistory;
import com.back.domain.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 지원 상태 변경 이력 Repository
 */
public interface SubmissionStatusHistoryRepository extends JpaRepository<SubmissionStatusHistory, Long> {

    /**
     * 특정 지원의 상태 변경 이력 조회 (최신순)
     *
     * @param submission 지원
     * @return 상태 변경 이력 목록
     */
    List<SubmissionStatusHistory> findBySubmissionOrderByCreateDateDesc(ProjectSubmission submission);

    /**
     * 특정 프로젝트의 모든 지원 상태 변경 이력 조회 (최신순)
     *
     * @param project 프로젝트
     * @return 상태 변경 이력 목록
     */
    List<SubmissionStatusHistory> findByProjectOrderByCreateDateDesc(Project project);
}
