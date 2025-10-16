package com.back.domain.freelancer.portfolio.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.portfolio.dto.PortfolioUpdateRequestDto;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@NoArgsConstructor
public class Portfolio extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    private Freelancer freelancer;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private int contribution;
    private String imageUrl;
    private String externalUrl;

    public Portfolio(Freelancer freelancer, String title, String description, LocalDate startDate, LocalDate endDate, int contribution, String imageUrl, String externalUrl) {
        this.freelancer = freelancer;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.contribution = contribution;
        this.imageUrl = imageUrl;
        this.externalUrl = externalUrl;
    }

    public void update(PortfolioUpdateRequestDto dto, String imageUrl) {
        this.title = dto.title();
        this.description = dto.description();
        this.startDate = dto.startDate();
        this.endDate = dto.endDate();
        this.contribution = dto.contribution();
        this.externalUrl = dto.externalUrl();
        this.imageUrl = imageUrl;
    }
}
