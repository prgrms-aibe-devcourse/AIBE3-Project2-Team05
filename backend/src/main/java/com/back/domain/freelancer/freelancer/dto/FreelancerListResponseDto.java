package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechDto;

import java.time.LocalDateTime;
import java.util.List;

public record FreelancerListResponseDto(
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
        int maxMonthlyRate,
        double ratingAvg,
        int reviewsCount,
        int favoritesCount,
        int completedProjectsCount,
        List<FreelancerTechDto> techList,
        String freelancerProfileImageUrl
){
    public FreelancerListResponseDto (Freelancer freelancer) {
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
                freelancer.getMaxMonthlyRate(),
                freelancer.getRatingAvg(),
                freelancer.getReviewsCount(),
                freelancer.getFavoritesCount(),
                freelancer.getCompletedProjectsCount(),
                freelancer.getTechStacks().stream().map(FreelancerTechDto::new).toList(),
                freelancer.getFreelancerProfileImageUrl()
        );

    }
}
