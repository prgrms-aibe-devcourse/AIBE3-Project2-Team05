package com.back.domain.project.project.entity.enums;

public enum ProjectStatus {
    RECRUITING("모집중"),
    CONTRACTING("계약중"),
    IN_PROGRESS("진행중"),
    COMPLETED("완료"),
    SUSPENDED("보류"),
    CANCELLED("취소");

    private final String description;

    ProjectStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}