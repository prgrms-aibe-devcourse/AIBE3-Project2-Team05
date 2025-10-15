package com.back.domain.freelancer.freelancerTech.dto;

import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;

public record FreelancerTechDto(
        long id,
        long techId,
        String techCategory,
        String techName,
        String techLevel
) {
    public FreelancerTechDto(FreelancerTech freelancerTech) {
        this(
                freelancerTech.getId(),
                freelancerTech.getTech().getId(),
                freelancerTech.getTech().getTechCategory(),
                freelancerTech.getTech().getTechName(),
                freelancerTech.getTechLevel().name()
        );
    }
}
