package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.freelancer.freelancer.entity.Freelancer;

import java.time.LocalDateTime;

public record FreelancerDto(

        long id,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        String nickname,
        String freelancerTitle,
        String type,
        String location,
        String content,
        Boolean isOnSite,
        int minMonthlyRate,
        int maxMonthlyRate
) {
    public FreelancerDto(Freelancer freelancer) {
        this(
                freelancer.getId(),
                freelancer.getCreateDate(),
                freelancer.getModifyDate(),
                freelancer.getMemberNickname(),
                freelancer.getFreelancerTitle(),
                freelancer.getType(),
                freelancer.getLocation(),
                freelancer.getContent(),
                freelancer.getIsOnSite(),
                freelancer.getMinMonthlyRate(),
                freelancer.getMaxMonthlyRate()
        );
    }
}

