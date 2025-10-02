package com.back.domain.project.project.entity;

import com.back.domain.project.project.entity.enums.TechCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_techs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTech {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tech_category", nullable = false, length = 50)
    private TechCategory techCategory;

    @Column(name = "tech_name", nullable = false, length = 50)
    private String techName;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = LocalDateTime.now();
        }
    }
}