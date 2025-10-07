package com.back.domain.freelancer.career.dto;

import com.back.domain.freelancer.career.entity.Career;

import java.time.LocalDate;

public record CareerResponseDto(
        Long id,
        String company,
        String position,
        LocalDate startDate,
        LocalDate endDate,
        Boolean current,
        String description
) {
    public CareerResponseDto(Career career) {
        this(
                career.getId(),
                career.getCompany(),
                career.getPosition(),
                career.getStartDate(),
                career.getEndDate(),
                career.getCurrent(),
                career.getDescription()
        );
    }
}
