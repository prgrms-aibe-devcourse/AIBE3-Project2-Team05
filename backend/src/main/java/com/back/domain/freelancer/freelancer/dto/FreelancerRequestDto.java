package com.back.domain.freelancer.freelancer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FreelancerRequestDto(
        @NotBlank String freelancerTitle,
        @NotBlank String type,
        @NotBlank String location,
        @NotBlank String content,
        @NotBlank Boolean isOnSite,
        @NotNull Integer minMonthlyRate,
        @NotNull Integer maxMonthlyRate
) {
}