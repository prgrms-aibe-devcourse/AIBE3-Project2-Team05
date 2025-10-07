package com.back.domain.freelancer.portfolio.dto;

import com.back.domain.freelancer.portfolio.entity.Portfolio;

import java.time.LocalDate;

public record PortfolioResponseDto(
        Long id,
        String title,
        String summary,
        LocalDate startDate,
        LocalDate endDate,
        int contribution,
        String imageUrl,
        String externalUrl
) {
    public PortfolioResponseDto(Portfolio portfolio) {
        this(
                portfolio.getId(),
                portfolio.getTitle(),
                portfolio.getSummary(),
                portfolio.getStartDate(),
                portfolio.getEndDate(),
                portfolio.getContribution(),
                portfolio.getImageUrl(),
                portfolio.getExternalUrl()
        );
    }
}
