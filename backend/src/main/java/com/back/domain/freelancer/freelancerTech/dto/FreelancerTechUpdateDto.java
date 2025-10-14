package com.back.domain.freelancer.freelancerTech.dto;

import jakarta.validation.constraints.NotBlank;

public record FreelancerTechUpdateDto(
        @NotBlank String techLevel
) {
}
