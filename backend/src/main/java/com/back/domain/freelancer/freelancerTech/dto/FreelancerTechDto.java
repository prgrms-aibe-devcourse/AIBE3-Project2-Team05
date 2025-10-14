package com.back.domain.freelancer.freelancerTech.dto;

import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;

public record FreelancerTechDto(
        long id,
        String techCategory,
        String techName,
        String techLevel
) {
    public FreelancerTechDto(FreelancerTech freelancerTech) {
        this(
                freelancerTech.getId(),
                freelancerTech.getTech().getTechCategory(),
                freelancerTech.getTech().getTechName(),
                freelancerTech.getTechLevel()
        );
    }
}
