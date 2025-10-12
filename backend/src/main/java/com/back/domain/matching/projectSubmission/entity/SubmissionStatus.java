package com.back.domain.matching.projectSubmission.entity;

/**
 * 프로젝트 지원 상태
 * 상태 흐름: PENDING → REVIEWING → APPROVED 또는 REJECTED
 */
public enum SubmissionStatus {
    /**
     * 대기 - 프리랜서가 프로젝트에 지원한 초기 상태
     */
    PENDING,

    /**
     * 검토중 - PM이 지원서를 검토하고 있는 상태
     */
    REVIEWING,

    /**
     * 승인 - PM이 지원을 승인한 상태
     */
    APPROVED,

    /**
     * 거절 - PM이 지원을 거절한 상태
     */
    REJECTED
}
