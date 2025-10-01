package com.back.domain.freelancer.tech.freelancerTech.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.tech.entity.Tech;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
public class FreelancerTech extends BaseEntity {

    @ManyToOne
    private Freelancer freelancer;

    @ManyToOne
    private Tech tech;
}
