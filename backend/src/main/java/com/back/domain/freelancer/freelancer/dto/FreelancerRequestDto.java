package com.back.domain.freelancer.freelancer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FreelancerRequestDto(
        @NotBlank String type,
        @NotBlank String content,
        @NotBlank Boolean isOnSite,
        @NotBlank String location,
        @NotNull Integer minMonthlyRate,
        @NotNull Integer maxMonthlyRate
) {
}