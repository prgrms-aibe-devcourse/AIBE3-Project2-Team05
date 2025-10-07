package com.back.domain.freelancer.portfolio.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.portfolio.dto.PortfolioRequestDto;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@NoArgsConstructor
public class Portfolio extends BaseEntity {

    @ManyToOne
    private Freelancer freelancer;

    private String title;
    private String summary;
    private LocalDate startDate;
    private LocalDate endDate;
    private int contribution;
    private String imageUrl;
    private String externalUrl;

    public Portfolio(Freelancer freelancer, String title, String summary, LocalDate startDate, LocalDate endDate, int contribution, String imageUrl, String externalUrl) {
        this.freelancer = freelancer;
        this.title = title;
        this.summary = summary;
        this.startDate = startDate;
        this.endDate = endDate;
        this.contribution = contribution;
        this.imageUrl = imageUrl;
        this.externalUrl = externalUrl;
    }

    public void update(PortfolioRequestDto dto) {
        this.title = dto.title();
        this.summary = dto.summary();
        this.startDate = dto.startDate();
        this.endDate = dto.endDate();
        this.contribution = dto.contribution();
        this.imageUrl = dto.imageUrl();
        this.externalUrl = dto.externalUrl();
    }
}
