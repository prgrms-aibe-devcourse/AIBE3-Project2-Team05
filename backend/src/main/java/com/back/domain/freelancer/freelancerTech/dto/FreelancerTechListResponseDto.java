package com.back.domain.freelancer.freelancerTech.dto;

import com.back.domain.tech.entity.Tech;

public record FreelancerTechListResponseDto(
        long id,
        String techCategory,
        String techName
) {
    public FreelancerTechListResponseDto(Tech tech) {
        this(
                tech.getId(),
                tech.getTechCategory(),
                tech.getTechName()
        );
    }
}
