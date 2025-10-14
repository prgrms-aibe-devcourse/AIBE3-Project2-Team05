package com.back.domain.freelancer.freelancer.entity;

import com.back.domain.freelancer.career.entity.Career;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import com.back.domain.member.member.entity.Member;
import com.back.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@NoArgsConstructor
@Entity
@Getter
@Setter
public class Freelancer extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    private Member member;

    // Todo member 에서 닉네임 수정 시 동기화 문제
    private String memberNickname;  //비정규화
    private String freelancerTitle;
    private String type;
    private String location;
    private String content;
    private Boolean isOnSite;
    private int minMonthlyRate;
    private int maxMonthlyRate;
    private String freelancerProfileImageUrl;
    private double ratingAvg;  //비정규화
    private int reviewsCount;  //비정규화
    private int favoritesCount;  //비정규화
    private int completedProjectsCount; //비정규화

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Portfolio> portfolioList = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Career> careerList = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<FreelancerTech> techStacks = new HashSet<>();


    public Freelancer(Member member, String freelancerTitle, String type, String location, String content, Boolean isOnSite, int minMonthlyRate, int maxMonthlyRate, String freelancerProfileImageUrl) {
        this.member = member;
        this.memberNickname = member.getNickname();
        this.freelancerTitle = freelancerTitle;
        this.type = type;
        this.location = location;
        this.content = content;
        this.isOnSite = isOnSite;
        this.minMonthlyRate = minMonthlyRate;
        this.maxMonthlyRate = maxMonthlyRate;
        this.freelancerProfileImageUrl = freelancerProfileImageUrl;
    }

    public void update(String freelancerTitle, String type, String location, String content, Boolean isOnSite, int minMonthlyRate, int maxMonthlyRate, String freelancerProfileImageUrl) {
        this.freelancerTitle = freelancerTitle;
        this.type = type;
        this.location = location;
        this.content = content;
        this.isOnSite = isOnSite;
        this.minMonthlyRate = minMonthlyRate;
        this.maxMonthlyRate = maxMonthlyRate;
        this.freelancerProfileImageUrl = freelancerProfileImageUrl;
    }

    public void checkCanUpdateOrDelete(Long freelancerId) {
        if (this.getId() != freelancerId) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
    }

}
