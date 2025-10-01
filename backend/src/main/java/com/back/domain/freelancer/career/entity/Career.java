package com.back.domain.freelancer.career.entity;

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
public class Career extends BaseEntity {

    @ManyToOne
    private Freelancer freelancer;

    private String company;
    private String position;
    private LocalDate start_date;
    private LocalDate end_date;
    private Boolean current;
    private String description;
}
