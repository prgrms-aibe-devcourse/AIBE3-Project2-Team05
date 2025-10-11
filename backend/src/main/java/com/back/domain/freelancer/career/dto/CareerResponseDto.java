package com.back.domain.freelancer.career.dto;

import com.back.domain.freelancer.career.entity.Career;

import java.time.LocalDate;

public record CareerResponseDto(
        String freelancerName,
        Long id,
        String title,
        String company,
        String position,
        LocalDate startDate,
        LocalDate endDate,
        Boolean current,
        String description
) {
    public CareerResponseDto(Career career) {
        this(
                career.getFreelancer().getMemberNickname(),
                career.getId(),
                career.getTitle(),
                career.getCompany(),
                career.getPosition(),
                career.getStartDate(),
                career.getEndDate(),
                career.getCurrent(),
                career.getDescription()
        );
    }
}
