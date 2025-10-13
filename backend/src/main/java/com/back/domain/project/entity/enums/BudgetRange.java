package com.back.domain.project.entity.enums;

public enum BudgetRange {
    RANGE_1_100("1만원 ~ 100만원"),
    RANGE_100_200("100만원 ~ 200만원"),
    RANGE_200_300("200만원 ~ 300만원"),
    RANGE_300_500("300만원 ~ 500만원"),
    RANGE_500_1000("500만원 ~ 1000만원"),
    RANGE_1000_2000("1000만원 ~ 2000만원"),
    RANGE_2000_3000("2000만원 ~ 3000만원"),
    RANGE_3000_5000("3000만원 ~ 5000만원"),
    RANGE_5000_OVER("5000만원 ~ 1억"),
    OVER_1_EUK("1억 이상"),
    NEGOTIABLE("협의");

    private final String description;

    BudgetRange(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}