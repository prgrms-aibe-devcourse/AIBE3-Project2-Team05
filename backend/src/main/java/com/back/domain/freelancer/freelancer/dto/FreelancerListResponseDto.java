package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;

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
        int ratingAvg,
        int reviewsCount,
        int favoritesCount,
        int completedProjectsCount,
        List<FreelancerTech> techList
){
//    public FreelancerListResponseDto (Freelancer freelancer) {
//        this(
//                freelancer.getId(),
//                freelancer.getCreateDate(),
//                freelancer.getModifyDate(),
//                freelancer.getMemberNickname(),
//                freelancer.getFreelancerTitle(),
//                freelancer.getType(),
//                freelancer.getLocation(),
//                freelancer.getContent(),
//                freelancer.getIsOnSite(),
//                freelancer.getMinMonthlyRate(),
//                freelancer.getMaxMonthlyRate(),
//                (int) Math.round(freelancer.getRatingAvg()),
//                freelancer.getReviewsCount(),
//                freelancer.getFavoritesCount(),
//                freelancer.getCompletedProjectsCount(),
//                freelancer.getFreelancerTechList()
//        )
//    }
}
