package com.back.domain.review.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;
    private Long authorId;
    private Long targetUserId;

    private int rating;
    private String title;
    private String content;

    private boolean deleted = false;

    @CreationTimestamp // ✅ 생성 시 자동으로 현재 시간 저장
    private LocalDateTime createdAt;

    @UpdateTimestamp // ✅ 수정 시 자동 갱신
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    public void setDeletedAt(LocalDateTime deletedAt) {   // ✅ 수정된 부분
        this.deletedAt = deletedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}