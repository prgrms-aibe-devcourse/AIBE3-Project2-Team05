package com.back.domain.project.project.entity;

import com.back.domain.project.project.entity.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_status_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 20)
    private ProjectStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 20)
    private ProjectStatus currentStatus;

    @Column(name = "changed_by_id", nullable = false)
    private Long changedById;

    @Column(name = "change_date", nullable = false)
    private LocalDateTime changeDate;

    @PrePersist
    protected void onCreate() {
        if (changeDate == null) {
            changeDate = LocalDateTime.now();
        }
    }
}