package com.back.domain.matching.message.entity;

/**
 * 메시지 연관 타입
 * 메시지가 어떤 컨텍스트에서 발생했는지 구분
 */
public enum RelatedType {
    /**
     * 프로젝트 지원과 관련된 메시지
     */
    SUBMISSION,

    /**
     * 프로젝트 제안과 관련된 메시지
     */
    PROPOSAL,

    /**
     * 프로젝트 일반 문의 메시지
     */
    PROJECT
}
