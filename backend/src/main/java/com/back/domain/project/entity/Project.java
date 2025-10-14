package com.back.domain.project.entity;

import com.back.domain.member.member.entity.Member;
import com.back.domain.project.entity.enums.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_field", nullable = false, length = 50)
    private ProjectField projectField;

    @Enumerated(EnumType.STRING)
    @Column(name = "recruitment_type", nullable = false, length = 50)
    private RecruitmentType recruitmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "partner_type", length = 50)
    private PartnerType partnerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_type", nullable = false, length = 20)
    private BudgetRange budgetType;

    @Column(name = "budget_amount")
    private Long budgetAmount;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_status", length = 50)
    private ProgressStatus progressStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_location", length = 20)
    private Region companyLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.RECRUITING;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "applicant_count", nullable = false)
    private Integer applicantCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private Member manager;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    @Column(name = "modify_date")
    private LocalDateTime modifyDate;

    @Column(name = "partner_etc_description", columnDefinition = "TEXT")
    private String partnerEtcDescription;

    // 연관관계 매핑
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ProjectTech> projectTechs;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ProjectFile> projectFiles;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ProjectFavorite> projectFavorites;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createDate == null) {
            createDate = now;
        }
        if (viewCount == null) {
            viewCount = 0;
        }
        if (status == null) {
            status = ProjectStatus.RECRUITING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        modifyDate = LocalDateTime.now();
    }

    // 기본 생성자를 위한 추가 생성자
    public Project(String title, String description, ProjectField projectField,
                   RecruitmentType recruitmentType, BudgetRange budgetType,
                   LocalDate startDate, LocalDate endDate, Member manager) {
        this.title = title;
        this.description = description;
        this.projectField = projectField;
        this.recruitmentType = recruitmentType;
        this.budgetType = budgetType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.manager = manager;
        this.status = ProjectStatus.RECRUITING;
        this.viewCount = 0;
        this.applicantCount = 0;
        this.createDate = LocalDateTime.now();
    }

    // 검증 제약조건
    public void validateDates() {
        if (endDate != null && startDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("종료일은 시작일 이후여야 합니다.");
        }
    }

    public void validateBudget() {
        if (budgetAmount != null && budgetAmount <= 0) {
            throw new IllegalArgumentException("예산은 양수여야 합니다.");
        }
    }
}