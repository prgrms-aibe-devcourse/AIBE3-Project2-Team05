package com.back.domain.freelancer.career.entity;

import com.back.domain.freelancer.career.dto.CareerRequestDto;
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
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean current;
    private String description;

    public Career(Freelancer freelancer, String company, String position, LocalDate startDate, LocalDate endDate, Boolean current, String description) {
        this.freelancer = freelancer;
        this.company = company;
        this.position = position;
        this.startDate = startDate;
        this.endDate = endDate;
        this.current = current;
        this.description = description;
    }

    public void update(CareerRequestDto dto) {
        this.company = dto.company();
        this.position = dto.position();
        this.startDate = dto.startDate();
        this.endDate = dto.endDate();
        this.current = dto.current();
        this.description = dto.description();
    }
}
