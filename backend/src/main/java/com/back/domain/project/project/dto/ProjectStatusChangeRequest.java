package com.back.domain.project.project.dto;

import com.back.domain.project.project.entity.enums.ProjectStatus;

/**
 * 프로젝트 상태 변경 요청 DTO
 */
public record ProjectStatusChangeRequest(
    ProjectStatus status,
    Long changedById
) {
    public ProjectStatusChangeRequest {
        if (status == null) {
            throw new IllegalArgumentException("프로젝트 상태는 필수입니다.");
        }
        if (changedById == null) {
            throw new IllegalArgumentException("변경자 ID는 필수입니다.");
        }
    }
}
