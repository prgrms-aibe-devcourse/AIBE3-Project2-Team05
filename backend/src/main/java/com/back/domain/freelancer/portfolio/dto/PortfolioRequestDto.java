package com.back.domain.freelancer.portfolio.dto;

import java.time.LocalDate;

public record PortfolioRequestDto(
        String title,
        String summary,
        LocalDate startDate,
        LocalDate endDate,
        int contribution,
        String imageUrl,
        String externalUrl
) {
}
