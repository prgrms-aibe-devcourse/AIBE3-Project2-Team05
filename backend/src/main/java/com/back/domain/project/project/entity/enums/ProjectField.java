package com.back.domain.project.project.entity.enums;

public enum ProjectField {
    PLANNING("기획"),
    DESIGN("디자인"),
    DEVELOPMENT("개발");

    private final String description;

    ProjectField(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}