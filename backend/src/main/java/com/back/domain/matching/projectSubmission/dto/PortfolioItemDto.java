package com.back.domain.matching.projectSubmission.dto;

/**
 * 포트폴리오 항목 DTO
 * 지원서 제출 시 포함되는 포트폴리오 정보
 */
public record PortfolioItemDto(
        String title,
        String description,
        String url,
        String thumbnailUrl
) {
}
