package com.back.domain.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "리뷰 작성/수정 요청 DTO")
public class ReviewRequestDto {

    @Schema(description = "리뷰 대상 사용자 ID (프리랜서)", example = "5")
    private Long targetFreelancerId;

    @Schema(description = "리뷰가 연결된 프로젝트 ID", example = "10")
    private Long projectId;

    @Schema(description = "평점 (1~5)", example = "5")
    private int rating;

    @Schema(description = "리뷰 제목", example = "훌륭한 협업이었습니다!")
    private String title;

    @Schema(description = "리뷰 내용", example = "소통이 빠르고 결과물의 완성도가 높았습니다.")
    private String content;
}