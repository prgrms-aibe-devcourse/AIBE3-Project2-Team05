package com.back.global;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "create_date", updatable = false)
    private LocalDateTime createDate;

    @LastModifiedDate
    @Column(name = "modify_date")
    private LocalDateTime modifyDate;

    @PrePersist
    protected void onCreate() {
        createDate = LocalDateTime.now();
        modifyDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        modifyDate = LocalDateTime.now();
    }
}