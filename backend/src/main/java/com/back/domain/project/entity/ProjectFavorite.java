package com.back.domain.project.entity;

import com.back.domain.member.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_favorites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    // 기본 생성자
    public ProjectFavorite(Member member, Project project) {
        this.member = member;
        this.project = project;
        this.createDate = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = LocalDateTime.now();
        }
    }
}
