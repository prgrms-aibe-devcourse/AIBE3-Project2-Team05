package com.back.domain.matching.projectSubmission.entity;

/**
 * 프로젝트 지원 상태
 * 상태 흐름: PENDING → ACCEPTED 또는 REJECTED
 */
public enum SubmissionStatus {
    /**
     * 대기 - 프리랜서가 프로젝트에 지원한 초기 상태
     */
    PENDING,

    /**
     * 수락 - PM이 지원을 수락한 상태
     */
    ACCEPTED,

    /**
     * 거절 - PM이 지원을 거절한 상태
     */
    REJECTED
}
