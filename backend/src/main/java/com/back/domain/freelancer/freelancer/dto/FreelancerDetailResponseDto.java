package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.freelancer.freelancer.entity.Freelancer;

import java.time.LocalDateTime;

public record FreelancerDetailResponseDto(

        //Member
        String nickname,

        //Freelancer
        long id,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        String type,
        String content,
        Boolean isOnSite,
        String location,
        int minMonthlyRate,
        int maxMonthlyRate
) {
    public FreelancerDetailResponseDto(String nickname, Freelancer freelancer) {
        this(
                nickname,
                freelancer.getId(),
                freelancer.getCreateDate(),
                freelancer.getModifyDate(),
                freelancer.getType(),
                freelancer.getContent(),
                freelancer.getIsOnSite(),
                freelancer.getLocation(),
                freelancer.getMinMonthlyRate(),
                freelancer.getMaxMonthlyRate()
        );
    }
}

