package com.back.domain.project.project.entity.enums;

public enum RecruitmentType {
    PROJECT_CONTRACT("프로젝트 단위 계약(외주)"),
    PERSONAL_CONTRACT("개인 인력의 기간/시간제 계약(상주)");

    private final String description;

    RecruitmentType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}