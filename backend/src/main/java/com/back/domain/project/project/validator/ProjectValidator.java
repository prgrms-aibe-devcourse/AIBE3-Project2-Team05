package com.back.domain.project.project.validator;

import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.enums.ProjectStatus;
import com.back.global.exception.ProjectAccessDeniedException;
import com.back.global.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 프로젝트 관련 검증 로직 중앙화 클래스
 */
@Slf4j
@Component
public class ProjectValidator {

    /**
     * 프로젝트 기본 정보 검증
     */
    public void validateProject(Project project) {
        log.debug("프로젝트 검증 시작 - projectId: {}", project.getId());

        // Null 체크
        validateNotNull(project.getTitle(), "프로젝트 제목은 필수입니다.");
        validateNotNull(project.getDescription(), "프로젝트 설명은 필수입니다.");
        validateNotNull(project.getProjectField(), "프로젝트 분야는 필수입니다.");
        validateNotNull(project.getRecruitmentType(), "모집 형태는 필수입니다.");
        validateNotNull(project.getBudgetType(), "예산 유형은 필수입니다.");
        validateNotNull(project.getStartDate(), "시작일은 필수입니다.");
        validateNotNull(project.getEndDate(), "종료일은 필수입니다.");
        validateNotNull(project.getManagerId(), "프로젝트 관리자는 필수입니다.");

        // 길이 검증
        validateStringLength(project.getTitle(), 200, "프로젝트 제목은 200자를 초과할 수 없습니다.");
        validateStringLength(project.getDescription(), 5000, "프로젝트 설명은 5000자를 초과할 수 없습니다.");

        // 선택적 필드 길이 검증
        validateStringLength(project.getProgressStatus(), 1000, "진행 상황은 1000자를 초과할 수 없습니다.");
        validateStringLength(project.getCompanyLocation(), 200, "회사 위치는 200자를 초과할 수 없습니다.");
        validateStringLength(project.getPartnerEtcDescription(), 2000, "기타 설명은 2000자를 초과할 수 없습니다.");

        // 엔티티 자체 검증
        project.validateDates();
        project.validateBudget();

        log.debug("프로젝트 검증 완료 - projectId: {}", project.getId());
    }

    /**
     * Null 값 검증
     */
    public void validateNotNull(Object value, String message) {
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(message);
        }
    }

    /**
     * 문자열 길이 검증
     */
    public void validateStringLength(String value, int maxLength, String message) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(message);
        }
    }

    /**
     * 프로젝트 소유권 검증
     */
    public void validateProjectOwnership(Project project, Long requesterId) {
        if (project == null) {
            throw new IllegalArgumentException("프로젝트 정보가 없습니다.");
        }
        if (requesterId == null) {
            throw new IllegalArgumentException("요청자 ID가 없습니다.");
        }
        if (!project.getManagerId().equals(requesterId)) {
            log.warn("프로젝트 소유권 검증 실패 - projectId: {}, managerId: {}, requesterId: {}",
                    project.getId(), project.getManagerId(), requesterId);
            throw new ProjectAccessDeniedException();
        }
    }

    /**
     * 상태 변경 권한 검증
     */
    public void validateStatusChangePermission(Project project, Long requesterId) {
        validateProjectOwnership(project, requesterId); // 소유권 검증과 동일
    }

    /**
     * 프로젝트 상태 전환 검증
     */
    public void validateStatusTransition(ProjectStatus from, ProjectStatus to) {
        if (from == null || to == null) {
            throw new ValidationException("상태 정보가 누락되었습니다.", "MISSING_STATUS_INFO");
        }

        // 완료된 프로젝트는 모집중으로 변경 불가
        if (from == ProjectStatus.COMPLETED && to == ProjectStatus.RECRUITING) {
            throw new ValidationException("완료된 프로젝트는 모집중으로 변경할 수 없습니다.", "INVALID_STATUS_TRANSITION");
        }

        // 중단된 프로젝트는 진행중으로 직접 변경 불가
        if (from == ProjectStatus.CANCELLED && to == ProjectStatus.IN_PROGRESS) {
            throw new ValidationException("중단된 프로젝트는 진행중으로 직접 변경할 수 없습니다.", "INVALID_STATUS_TRANSITION");
        }

        // 취소된 프로젝트는 완료로 변경 불가
        if (from == ProjectStatus.CANCELLED && to == ProjectStatus.COMPLETED) {
            throw new ValidationException("취소된 프로젝트는 완료로 변경할 수 없습니다.", "INVALID_STATUS_TRANSITION");
        }

        log.debug("상태 전환 검증 통과 - from: {}, to: {}", from, to);
    }

    /**
     * ID 값 검증
     */
    public void validateId(Long id, String fieldName) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(fieldName + "는 유효한 값이어야 합니다.");
        }
    }

    /**
     * 페이징 파라미터 검증
     */
    public void validatePagingParameters(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("페이지 번호는 0 이상이어야 합니다.");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("페이지 크기는 1 이상이어야 합니다.");
        }
        if (size > 100) {
            throw new IllegalArgumentException("페이지 크기는 100 이하여야 합니다.");
        }
    }

    /**
     * 검색 키워드 검증
     */
    public void validateSearchKeyword(String keyword) {
        if (keyword != null && keyword.trim().length() > 100) {
            throw new IllegalArgumentException("검색 키워드는 100자 이하여야 합니다.");
        }
    }

    /**
     * 예산 범위 검증
     */
    public void validateBudgetRange(Long minBudget, Long maxBudget) {
        if (minBudget != null && minBudget < 0) {
            throw new IllegalArgumentException("최소 예산은 0 이상이어야 합니다.");
        }
        if (maxBudget != null && maxBudget < 0) {
            throw new IllegalArgumentException("최대 예산은 0 이상이어야 합니다.");
        }
        if (minBudget != null && maxBudget != null && minBudget > maxBudget) {
            throw new IllegalArgumentException("최소 예산은 최대 예산보다 클 수 없습니다.");
        }
    }
}
