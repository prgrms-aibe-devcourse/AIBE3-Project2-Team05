package com.back.domain.freelancer.freelancer.entity;

import com.back.domain.member.entity.Member;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Entity
@Getter
public class Freelancer extends BaseEntity {

    @OneToOne
    private Member member;

    private String type;
    private String content;
    private Boolean isOnSite;
    private String location;
    private int minMonthlyRate;
    private int maxMonthlyRate;
    private int experienceYears;
    private double ratingAvg;
    private int reviewsCount;
    private int favoritesCount;

    public Freelancer(Member member, String type, String content, Boolean isOnSite,
                      String location, int minMonthlyRate, int maxMonthlyRate) {
        this.member = member;
        this.type = type;
        this.content = content;
        this.isOnSite = isOnSite;
        this.location = location;
        this.minMonthlyRate = minMonthlyRate;
        this.maxMonthlyRate = maxMonthlyRate;
        this.experienceYears = 1;
        this.ratingAvg = 1;
        this.reviewsCount = 1;
        this.favoritesCount = 1;
    }

}
