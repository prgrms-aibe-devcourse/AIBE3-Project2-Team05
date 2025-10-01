package com.back.domain.freelancer.portfolio.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
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
    private LocalDate start_date;
    private LocalDate end_date;
    private int contribution;
    private String image_url;
    private String external_url;
}
