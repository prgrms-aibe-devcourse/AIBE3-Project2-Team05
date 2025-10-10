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
        validateEnumValue(project.getProgressStatus(), "진행 상황");
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
     * Enum 값 검증 (선택적 필드)
     */
    public void validateEnumValue(Enum<?> value, String fieldName) {
        // Enum은 null이어도 되는 선택적 필드로 처리
        // 값이 있다면 유효한 enum 값인지는 Java 컴파일러가 보장
        log.debug("{} 검증 완료 - value: {}", fieldName, value);
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
     * 새로운 상태 흐름: 모집중 → 계약중 → 진행중 → 완료/보류/취소
     */
    public void validateStatusTransition(ProjectStatus from, ProjectStatus to) {
        if (from == null || to == null) {
            throw new ValidationException("상태 정보가 누락되었습니다.", "MISSING_STATUS_INFO");
        }

        // 같은 상태로 변경하는 경우는 허용
        if (from == to) {
            return;
        }

        switch (from) {
            case RECRUITING:
                // 모집중에서는 계약중, 취소로만 변경 가능
                if (to != ProjectStatus.CONTRACTING && to != ProjectStatus.CANCELLED) {
                    throw new ValidationException("모집중 상태에서는 계약중 또는 취소로만 변경할 수 있습니다.", "INVALID_STATUS_TRANSITION");
                }
                break;

            case CONTRACTING:
                // 계약중에서는 진행중, 보류, 취소로만 변경 가능
                if (to != ProjectStatus.IN_PROGRESS && to != ProjectStatus.SUSPENDED && to != ProjectStatus.CANCELLED) {
                    throw new ValidationException("계약중 상태에서는 진행중, 보류 또는 취소로만 변경할 수 있습니다.", "INVALID_STATUS_TRANSITION");
                }
                break;

            case IN_PROGRESS:
                // 진행중에서는 완료, 보류, 취소로만 변경 가능
                if (to != ProjectStatus.COMPLETED && to != ProjectStatus.SUSPENDED && to != ProjectStatus.CANCELLED) {
                    throw new ValidationException("진행중 상태에서는 완료, 보류 또는 취소로만 변경할 수 있습니다.", "INVALID_STATUS_TRANSITION");
                }
                break;

            case SUSPENDED:
                // 보류에서는 진행중, 취소로만 변경 가능 (재개 또는 최종 취소)
                if (to != ProjectStatus.IN_PROGRESS && to != ProjectStatus.CANCELLED) {
                    throw new ValidationException("보류 상태에서는 진행중(재개) 또는 취소로만 변경할 수 있습니다.", "INVALID_STATUS_TRANSITION");
                }
                break;

            case COMPLETED:
                // 완료된 프로젝트는 상태 변경 불가
                throw new ValidationException("완료된 프로젝트의 상태는 변경할 수 없습니다.", "INVALID_STATUS_TRANSITION");

            case CANCELLED:
                // 취소된 프로젝트는 상태 변경 불가
                throw new ValidationException("취소된 프로젝트의 상태는 변경할 수 없습니다.", "INVALID_STATUS_TRANSITION");

            default:
                throw new ValidationException("알 수 없는 프로젝트 상태입니다.", "UNKNOWN_STATUS");
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
