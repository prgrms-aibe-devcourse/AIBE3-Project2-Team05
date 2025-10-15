package com.back.domain.matching.projectSubmission.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.matching.projectSubmission.entity.ProjectSubmission;
import com.back.domain.matching.projectSubmission.entity.SubmissionStatus;
import com.back.domain.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 프로젝트 지원 Repository
 */
public interface ProjectSubmissionRepository extends JpaRepository<ProjectSubmission, Long> {

    /**
     * 프리랜서가 특정 프로젝트에 지원했는지 확인
     * 중복 지원 방지를 위해 사용
     *
     * @param freelancer 프리랜서
     * @param project    프로젝트
     * @return 지원 여부
     */
    boolean existsByFreelancerAndProject(Freelancer freelancer, Project project);

    /**
     * 프리랜서의 모든 지원 목록 조회 (최신순)
     *
     * @param freelancer 프리랜서
     * @return 지원 목록
     */
    List<ProjectSubmission> findByFreelancerOrderByCreateDateDesc(Freelancer freelancer);

    /**
     * 프리랜서의 특정 상태 지원 목록 조회
     *
     * @param freelancer 프리랜서
     * @param status     지원 상태
     * @return 지원 목록
     */
    List<ProjectSubmission> findByFreelancerAndStatusOrderByCreateDateDesc(
            Freelancer freelancer,
            SubmissionStatus status
    );

    /**
     * 프로젝트의 모든 지원자 목록 조회 (최신순)
     *
     * @param project 프로젝트
     * @return 지원 목록
     */
    List<ProjectSubmission> findByProjectOrderByCreateDateDesc(Project project);

    /**
     * 프로젝트의 특정 상태 지원자 목록 조회
     *
     * @param project 프로젝트
     * @param status  지원 상태
     * @return 지원 목록
     */
    List<ProjectSubmission> findByProjectAndStatusOrderByCreateDateDesc(
            Project project,
            SubmissionStatus status
    );

    /**
     * 프로젝트의 지원자 수 조회
     *
     * @param project 프로젝트
     * @return 지원자 수
     */
    long countByProject(Project project);

    /**
     * 프로젝트의 특정 상태 지원자 수 조회
     *
     * @param project 프로젝트
     * @param status  지원 상태
     * @return 지원자 수
     */
    long countByProjectAndStatus(Project project, SubmissionStatus status);

    /**
     * 특정 프리랜서의 특정 프로젝트 지원 조회
     *
     * @param freelancer 프리랜서
     * @param project    프로젝트
     * @return 지원 정보
     */
    Optional<ProjectSubmission> findByFreelancerAndProject(Freelancer freelancer, Project project);

    /**
     * 취소되지 않은 지원만 조회
     *
     * @param freelancer 프리랜서
     * @return 지원 목록
     */
    @Query("SELECT ps FROM ProjectSubmission ps WHERE ps.freelancer = :freelancer AND ps.cancelledAt IS NULL ORDER BY ps.createDate DESC")
    List<ProjectSubmission> findActiveSubmissionsByFreelancer(@Param("freelancer") Freelancer freelancer);

    /**
     * 프로젝트의 취소되지 않은 지원만 조회
     *
     * @param project 프로젝트
     * @return 지원 목록
     */
    @Query("SELECT ps FROM ProjectSubmission ps WHERE ps.project = :project AND ps.cancelledAt IS NULL ORDER BY ps.createDate DESC")
    List<ProjectSubmission> findActiveSubmissionsByProject(@Param("project") Project project);
}
