package com.back.domain.project.project.service;

import com.back.domain.project.project.entity.ProjectStatusHistory;
import com.back.domain.project.project.entity.enums.ProjectStatus;
import com.back.domain.project.project.repository.ProjectStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectStatusHistoryService {

    private final ProjectStatusHistoryRepository statusHistoryRepository;

    /**
     * 프로젝트의 상태 변경 이력 조회
     */
    @Transactional(readOnly = true)
    public List<ProjectStatusHistory> getProjectStatusHistory(Long projectId) {
        log.debug("프로젝트 상태 이력 조회 - projectId: {}", projectId);
        return statusHistoryRepository.findByProjectIdOrderByChangeDateDesc(projectId);
    }

    /**
     * 상태 이력 생성 (다른 서비스에서 호출)
     */
    @Transactional
    public ProjectStatusHistory createStatusHistory(Long projectId, ProjectStatus previousStatus,
                                                    ProjectStatus currentStatus, Long changedById) {
        log.info("상태 이력 생성 - projectId: {}, previousStatus: {}, currentStatus: {}, changedById: {}",
                projectId, previousStatus, currentStatus, changedById);

        // 입력값 검증
        validateStatusHistory(projectId, currentStatus, changedById);

        ProjectStatusHistory history = ProjectStatusHistory.builder()
                .projectId(projectId)
                .previousStatus(previousStatus)
                .currentStatus(currentStatus)
                .changedById(changedById)
                .changeDate(LocalDateTime.now())
                .build();

        return statusHistoryRepository.save(history);
    }

    /**
     * 프로젝트의 모든 상태 이력 삭제 (프로젝트 삭제 시 사용)
     */
    @Transactional
    public void removeAllProjectStatusHistory(Long projectId) {
        log.info("프로젝트 상태 이력 전체 삭제 - projectId: {}", projectId);
        statusHistoryRepository.deleteByProjectId(projectId);
    }

    // ===== Private Helper Methods =====

    /**
     * 상태 이력 입력값 검증
     */
    private void validateStatusHistory(Long projectId, ProjectStatus currentStatus, Long changedById) {
        if (projectId == null) {
            throw new IllegalArgumentException("프로젝트 ID는 필수입니다.");
        }

        if (currentStatus == null) {
            throw new IllegalArgumentException("현재 상태는 필수입니다.");
        }

        if (changedById == null) {
            throw new IllegalArgumentException("변경자 ID는 필수입니다.");
        }
    }
}