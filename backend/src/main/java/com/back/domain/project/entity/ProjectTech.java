package com.back.domain.project.entity;

import com.back.domain.project.entity.enums.TechCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_techs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTech {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(name = "tech_category", nullable = false, length = 50)
    private TechCategory techCategory;

    @Column(name = "tech_name", nullable = false, length = 50)
    private String techName;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    // 기본 생성자
    public ProjectTech(Project project, TechCategory techCategory, String techName) {
        this.project = project;
        this.techCategory = techCategory;
        this.techName = techName;
        this.createDate = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = LocalDateTime.now();
        }
    }
}