package com.back.domain.freelancer.portfolio.dto;

import java.time.LocalDate;

public record PortfolioSaveRequestDto(
        String title,
        String summary,
        LocalDate startDate,
        LocalDate endDate,
        int contribution,
        String externalUrl
) {
}
