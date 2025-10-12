package com.back.global.baseEntity;

import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 임시 클래스 - 매칭 시스템 개발/테스트용
 * TODO: [Global 담당자] - 정식 BaseEntity로 교체 필요
 *
 * JPA Entity 공통 필드 (id, createDate, modifyDate)
 * 참조: /Users/cklim/aibe/social-login/backend/.../BaseEntity.java
 */
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
@Getter
public abstract class BaseEntity {

    /**
     * ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    /**
     * 생성일시
     */
    @CreatedDate
    @Column(name = "create_date", updatable = false)
    private LocalDateTime createDate;

    /**
     * 수정일시
     */
    @LastModifiedDate
    @Column(name = "modify_date")
    private LocalDateTime modifyDate;
}
