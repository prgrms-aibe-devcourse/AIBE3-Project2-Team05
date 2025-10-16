package com.back.domain.review.dto;

import com.back.domain.review.entity.Review;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDto {

    private Long id;
    private Long projectId;
    private Long authorId;
    private String authorNickname; // ✅ 작성자 닉네임
    private Long targetUserId;
    private int rating;
    private String title;
    private String content;
    private LocalDateTime createdAt;

    public static ReviewResponseDto fromEntity(Review review) {
        return ReviewResponseDto.builder()
                .id(review.getId())
                .projectId(review.getProjectId())
                .authorId(review.getAuthor().getId()) // ✅ Member의 ID
                .authorNickname(review.getAuthor().getNickname()) // ✅ Member의 닉네임
                .targetUserId(review.getTargetUser().getId())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
