package com.back.domain.project.project.entity.enums;

public enum TechCategory {
    FRONTEND("프론트엔드"),
    BACKEND("백엔드"),
    DATABASE("데이터베이스");

    private final String description;

    TechCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}