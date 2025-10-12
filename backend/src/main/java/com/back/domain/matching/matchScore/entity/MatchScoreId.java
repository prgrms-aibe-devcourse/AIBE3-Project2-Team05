package com.back.domain.matching.matchScore.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * MatchScore Entity의 복합키
 * 프로젝트와 프리랜서의 고유한 조합을 나타냄
 */
@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MatchScoreId implements Serializable {

    /**
     * 프로젝트 ID
     */
    private Long projectId;

    /**
     * 프리랜서 회원 ID
     */
    private Long freelancerMemberId;
}
