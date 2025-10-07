package com.back.domain.freelancer.career.dto;

import java.time.LocalDate;

public record CareerRequestDto(
        String company,
        String position,
        LocalDate startDate,
        LocalDate endDate,
        Boolean current,
        String description
) {
}
