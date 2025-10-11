package com.back.domain.freelancer.portfolio.dto;

import java.time.LocalDate;

public record PortfolioUpdateRequestDto(
        String title,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        int contribution,
        String externalUrl,
        Boolean deleteExistingImage
) {
}
