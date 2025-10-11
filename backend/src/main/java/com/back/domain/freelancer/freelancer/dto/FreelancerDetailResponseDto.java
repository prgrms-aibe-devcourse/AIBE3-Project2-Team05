package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.freelancer.freelancer.entity.Freelancer;

import java.time.LocalDateTime;

// todo 전면 수정
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
    public FreelancerDetailResponseDto(Freelancer freelancer) {
        this(
                freelancer.getMemberNickname(),
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

