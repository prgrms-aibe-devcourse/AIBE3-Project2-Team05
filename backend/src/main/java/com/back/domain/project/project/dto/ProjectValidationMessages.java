package com.back.domain.project.project.dto;

/**
 * 프로젝트 관련 검증 메시지 상수
 */
public final class ProjectValidationMessages {

    // 필수 입력 검증 메시지
    public static final String TITLE_REQUIRED = "프로젝트 제목은 필수입니다";
    public static final String TITLE_MAX_LENGTH = "프로젝트 제목은 200자 이하여야 합니다";
    public static final String DESCRIPTION_REQUIRED = "프로젝트 설명은 필수입니다";
    public static final String PROJECT_FIELD_REQUIRED = "프로젝트 분야는 필수입니다";
    public static final String RECRUITMENT_TYPE_REQUIRED = "모집 유형은 필수입니다";
    public static final String BUDGET_TYPE_REQUIRED = "예산 범위는 필수입니다";
    public static final String START_DATE_REQUIRED = "시작일은 필수입니다";
    public static final String END_DATE_REQUIRED = "종료일은 필수입니다";
    public static final String MANAGER_ID_REQUIRED = "매니저 ID는 필수입니다";

    // 추가 정보 검증 메시지
    public static final String PROGRESS_STATUS_MAX_LENGTH = "진행 상태는 100자 이하여야 합니다";
    public static final String COMPANY_LOCATION_MAX_LENGTH = "회사 위치는 100자 이하여야 합니다";

    private ProjectValidationMessages() {
        // 유틸리티 클래스 - 인스턴스화 방지
    }
}
