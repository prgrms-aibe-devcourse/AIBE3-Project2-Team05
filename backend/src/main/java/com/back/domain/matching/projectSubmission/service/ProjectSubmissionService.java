package com.back.domain.matching.projectSubmission.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.matching.projectSubmission.entity.ProjectSubmission;
import com.back.domain.matching.projectSubmission.entity.SubmissionStatus;
import com.back.domain.matching.projectSubmission.entity.SubmissionStatusHistory;
import com.back.domain.matching.projectSubmission.repository.ProjectSubmissionRepository;
import com.back.domain.matching.projectSubmission.repository.SubmissionStatusHistoryRepository;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import com.back.domain.freelancer.portfolio.repository.PortfolioRepository;
import com.back.domain.notification.notification.entity.NotificationType;
import com.back.domain.notification.notification.service.NotificationService;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 프로젝트 지원 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectSubmissionService {

    private final ProjectSubmissionRepository projectSubmissionRepository;
    private final ProjectRepository projectRepository;
    private final SubmissionStatusHistoryRepository submissionStatusHistoryRepository;
    private final NotificationService notificationService;

    /**
     * 프로젝트 지원 생성
     *
     * @param freelancer        지원하는 프리랜서
     * @param projectId         프로젝트 ID
     * @param coverLetter       자기소개서
     * @param proposedRate      제안 단가 (시간당, 원)
     * @param estimatedDuration 예상 소요 기간 (일)
     * @param portfolioData     포트폴리오 데이터 (JSON 문자열)
     * @return 생성된 지원
     */
    @Transactional
    public ProjectSubmission create(
            Freelancer freelancer,
            Long projectId,
            String coverLetter,
            Integer proposedRate,
            Integer estimatedDuration,
            String portfolioData
    ) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        // 중복 지원 확인
        if (projectSubmissionRepository.existsByFreelancerAndProject(freelancer, project)) {
            throw new ServiceException("409-1", "이미 지원한 프로젝트입니다.");
        }

        // 지원 생성
        ProjectSubmission submission = new ProjectSubmission(
                project,
                freelancer,
                coverLetter,
                proposedRate,
                estimatedDuration,
                portfolioData
        );

        ProjectSubmission savedSubmission = projectSubmissionRepository.save(submission);

        // 지원자 수 증가
        project.incrementApplicantCount();

        return savedSubmission;
    }

    /**
     * 지원 ID로 조회
     *
     * @param id 지원 ID
     * @return 지원
     */
    public ProjectSubmission findById(Long id) {
        return projectSubmissionRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 지원입니다."));
    }

    /**
     * 프리랜서의 지원 목록 조회
     *
     * @param freelancer 프리랜서
     * @return 지원 목록
     */
    public List<ProjectSubmission> findByFreelancer(Freelancer freelancer) {
        return projectSubmissionRepository.findByFreelancerOrderByCreateDateDesc(freelancer);
    }

    /**
     * 프리랜서의 활성 지원 목록 조회 (취소되지 않은 지원)
     *
     * @param freelancer 프리랜서
     * @return 지원 목록
     */
    public List<ProjectSubmission> findActiveSubmissionsByFreelancer(Freelancer freelancer) {
        return projectSubmissionRepository.findActiveSubmissionsByFreelancer(freelancer);
    }

    /**
     * 프로젝트의 지원자 목록 조회
     *
     * @param projectId 프로젝트 ID
     * @return 지원 목록
     */
    public List<ProjectSubmission> findByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        return projectSubmissionRepository.findByProjectOrderByCreateDateDesc(project);
    }

    /**
     * 프로젝트의 활성 지원자 목록 조회 (취소되지 않은 지원)
     *
     * @param projectId 프로젝트 ID
     * @return 지원 목록
     */
    public List<ProjectSubmission> findActiveSubmissionsByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        return projectSubmissionRepository.findActiveSubmissionsByProject(project);
    }

    /**
     * 지원서 수정 (PENDING 상태에서만 가능)
     *
     * @param submission        지원
     * @param freelancer        프리랜서 (권한 확인용)
     * @param coverLetter       변경할 자기소개서
     * @param proposedRate      변경할 제안 단가
     * @param estimatedDuration 변경할 예상 소요 기간
     * @param portfolioData     변경할 포트폴리오 데이터 (JSON)
     */
    @Transactional
    public void modify(
            ProjectSubmission submission,
            Freelancer freelancer,
            String coverLetter,
            Integer proposedRate,
            Integer estimatedDuration,
            String portfolioData
    ) {
        // 권한 확인
        if (!submission.isOwner(freelancer)) {
            throw new ServiceException("403-1", "본인의 지원서만 수정할 수 있습니다.");
        }

        // 취소된 지원은 수정 불가
        if (submission.isCancelled()) {
            throw new ServiceException("400-1", "취소된 지원은 수정할 수 없습니다.");
        }

        // 수정 (PENDING 상태가 아니면 IllegalStateException 발생)
        submission.modify(coverLetter, proposedRate, estimatedDuration, portfolioData);
    }

    /**
     * 지원 취소
     *
     * @param submission 지원
     * @param freelancer 프리랜서 (권한 확인용)
     */
    @Transactional
    public void cancel(ProjectSubmission submission, Freelancer freelancer) {
        // 권한 확인
        if (!submission.isOwner(freelancer)) {
            throw new ServiceException("403-1", "본인의 지원만 취소할 수 있습니다.");
        }

        // 이미 취소된 지원
        if (submission.isCancelled()) {
            throw new ServiceException("400-1", "이미 취소된 지원입니다.");
        }

        // 수락된 지원은 취소 불가
        if (submission.getStatus() == SubmissionStatus.ACCEPTED) {
            throw new ServiceException("400-1", "수락된 지원은 취소할 수 없습니다.");
        }

        submission.cancel();

        // 지원자 수 감소
        submission.getProject().decrementApplicantCount();
    }

    /**
     * 지원 상태 변경 (PM 전용)
     *
     * @param submission   지원
     * @param newStatus    변경할 상태
     * @param changeReason 변경 사유 (선택)
     */
    @Transactional
    public void updateStatus(ProjectSubmission submission, SubmissionStatus newStatus, String changeReason) {
        // 취소된 지원은 상태 변경 불가
        if (submission.isCancelled()) {
            throw new ServiceException("400-1", "취소된 지원은 상태를 변경할 수 없습니다.");
        }

        // 이전 상태 저장
        SubmissionStatus previousStatus = submission.getStatus();

        // 상태 변경
        submission.updateStatus(newStatus);

        // 상태 변경 이력 저장
        SubmissionStatusHistory history = new SubmissionStatusHistory(
                submission,
                submission.getProject(),
                previousStatus,
                newStatus,
                changeReason
        );
        submissionStatusHistoryRepository.save(history);

        // 프리랜서에게 알림 전송 (ACCEPTED 또는 REJECTED인 경우만)
        if (newStatus == SubmissionStatus.ACCEPTED) {
            notificationService.create(
                    submission.getFreelancer().getMember(),
                    NotificationType.SUBMISSION_ACCEPTED,
                    "지원이 수락되었습니다",
                    String.format("'%s' 프로젝트 지원이 수락되었습니다.", submission.getProject().getTitle()),
                    "SUBMISSION",
                    submission.getId()
            );
        } else if (newStatus == SubmissionStatus.REJECTED) {
            notificationService.create(
                    submission.getFreelancer().getMember(),
                    NotificationType.SUBMISSION_REJECTED,
                    "지원이 거절되었습니다",
                    String.format("'%s' 프로젝트 지원이 거절되었습니다.", submission.getProject().getTitle()),
                    "SUBMISSION",
                    submission.getId()
            );
        }
    }

    /**
     * 지원 상태 변경 (PM 전용) - 사유 없음
     *
     * @param submission 지원
     * @param newStatus  변경할 상태
     */
    @Transactional
    public void updateStatus(ProjectSubmission submission, SubmissionStatus newStatus) {
        updateStatus(submission, newStatus, null);
    }

    /**
     * 프로젝트의 지원자 수 조회
     *
     * @param projectId 프로젝트 ID
     * @return 지원자 수
     */
    public long countByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        return projectSubmissionRepository.countByProject(project);
    }

    /**
     * 지원의 상태 변경 이력 조회
     *
     * @param submission 지원
     * @return 상태 변경 이력 목록
     */
    public List<SubmissionStatusHistory> getStatusHistory(ProjectSubmission submission) {
        return submissionStatusHistoryRepository.findBySubmissionOrderByCreateDateDesc(submission);
    }

    /**
     * 프로젝트의 모든 지원 상태 변경 이력 조회
     *
     * @param projectId 프로젝트 ID
     * @return 상태 변경 이력 목록
     */
    public List<SubmissionStatusHistory> getStatusHistoryByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));

        return submissionStatusHistoryRepository.findByProjectOrderByCreateDateDesc(project);
    }
}
