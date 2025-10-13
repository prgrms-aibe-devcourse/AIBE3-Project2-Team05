package com.back.domain.project.project.dto;

import com.back.domain.project.project.entity.Project;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 프로젝트 목록 DTO
 */
public record ProjectListDto(
        Long id,
        String title,
        String description,
        BigDecimal budget,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        String pmName
) {
    public ProjectListDto(Project project) {
        this(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getBudget(),
                project.getStartDate(),
                project.getEndDate(),
                project.getStatus(),
                project.getPm().getNickname()
        );
    }
}
