package com.back.domain.project.entity.enums;

public enum PartnerType {
    INDIVIDUAL_FREELANCER("개인 프리랜서를 선호합니다"),
    INDIVIDUAL_OR_TEAM_FREELANCER("개인 또는 팀 프리랜서 선호합니다"),
    BUSINESS_TEAM_OR_COMPANY("사업자가 있는 팀단위 또는 기업을 선호합니다"),
    ANY_TYPE("어떤 형태든 무관합니다"),
    ETC("기타");

    private final String description;

    PartnerType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}