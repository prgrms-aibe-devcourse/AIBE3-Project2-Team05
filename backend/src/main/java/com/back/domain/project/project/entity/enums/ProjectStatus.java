package com.back.domain.project.project.entity.enums;

public enum ProjectStatus {
    RECRUITING("모집중"),
    IN_PROGRESS("진행중"),
    CONTRACTING("계약중"),
    COMPLETED("완료"),
    CANCELLED("중단");

    private final String description;

    ProjectStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}