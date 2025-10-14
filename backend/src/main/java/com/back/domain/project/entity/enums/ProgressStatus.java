package com.back.domain.project.entity.enums;

public enum ProgressStatus {
    IDEA_STAGE("아이디어 구상 단계에요."),
    CONTENT_ORGANIZED("필요한 내용이 정리되었어요."),
    DETAILED_PLAN("상세 기획서가 있어요.");

    private final String description;

    ProgressStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
