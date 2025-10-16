package com.back.domain.review.controller;

import com.back.domain.freelancer.freelancer.service.FreelancerFinder;
import com.back.domain.review.dto.ReviewRequestDto;
import com.back.domain.review.dto.ReviewResponseDto;
import com.back.domain.review.service.ReviewService;
import com.back.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 요구사항:
 * - 등록/수정/삭제: 로그인 사용자만 가능 (작성자 본인)
 * - 조회/평균/전체목록: 비로그인도 가능
 * - authorId는 프론트에서 받지 않고, 인증 주체에서 추출
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final FreelancerFinder freelancerFinder;

    /** 리뷰 등록 (인증 필요) */
    @PostMapping
    public ResponseEntity<ReviewResponseDto> createReview(
            @AuthenticationPrincipal SecurityUser user,  // ✅ 인증 주체
            @RequestBody ReviewRequestDto request
    ) {
        Long authorId = user.getId();
        ReviewResponseDto created = reviewService.createReview(authorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created); // 201
    }

    /** 리뷰 수정 (인증 필요, 작성자 본인) */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> updateReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal SecurityUser user,
            @RequestBody ReviewRequestDto request
    ) {
        Long authorId = user.getId();
        ReviewResponseDto updated = reviewService.updateReview(reviewId, authorId, request);
        return ResponseEntity.ok(updated); // 200
    }

    /** 리뷰 삭제 (Soft Delete, 인증 필요, 작성자 본인) */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal SecurityUser user) {

        reviewService.deleteReview(reviewId, user.getId());
        return ResponseEntity.noContent().build();
    }


    /** 대상 사용자 리뷰 조회 (공개) */
    @GetMapping
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByTarget(
            @RequestParam Long targetUserId
    ) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsByTarget(targetUserId);
        return ResponseEntity.ok(reviews); // 200
    }

    //freelancerId로 조회하는 메서드 추가
    @GetMapping("/{freelancerId}")
    public List<ReviewResponseDto> getReviewsByFreelancerId(@PathVariable Long freelancerId) {
        return reviewService.getReviewsByFreelancerId(freelancerId);
    }

    /** 대상 사용자 평균 평점 조회 (공개) */
    @GetMapping("/average")
    public ResponseEntity<Double> getAverageRating(
            @RequestParam Long targetUserId
    ) {
        double avg = reviewService.getAverageRating(targetUserId);
        return ResponseEntity.ok(avg); // 200
    }

    /** 모든 리뷰 조회 (공개) - 오타 수정: /rerviews -> /all */
    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponseDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
}