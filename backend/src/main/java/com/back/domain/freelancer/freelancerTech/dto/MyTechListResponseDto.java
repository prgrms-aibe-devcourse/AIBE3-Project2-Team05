package com.back.domain.freelancer.freelancerTech.dto;

import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;

public record MyTechListResponseDto(
        long id,
        String techName,
        String techLevel
) {
    public MyTechListResponseDto(FreelancerTech freelancerTech) {
        this(
                freelancerTech.getId(),
                freelancerTech.getTech().getTechName(),
                freelancerTech.getTechLevel()
        );
    }
}
