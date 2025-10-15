package com.back.domain.matching.proposal.entity;

/**
 * 제안 상태
 * 상태 흐름: PENDING → ACCEPTED 또는 REJECTED
 *          PENDING → CANCELLED (PM이 취소)
 */
public enum ProposalStatus {
    /**
     * 대기 - PM이 프리랜서에게 제안한 초기 상태
     */
    PENDING,

    /**
     * 수락 - 프리랜서가 제안을 수락한 상태
     */
    ACCEPTED,

    /**
     * 거절 - 프리랜서가 제안을 거절한 상태
     */
    REJECTED,

    /**
     * 취소 - PM이 제안을 취소한 상태
     */
    CANCELLED
}
