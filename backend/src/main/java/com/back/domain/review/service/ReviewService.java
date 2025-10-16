package com.back.domain.review.service;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.review.dto.ReviewRequestDto;
import com.back.domain.review.dto.ReviewResponseDto;
import com.back.domain.review.entity.Review;
import com.back.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;

    /** 리뷰 생성 */
    public ReviewResponseDto createReview(Long authorId, ReviewRequestDto dto) {
        Member author = memberRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("작성자 회원을 찾을 수 없습니다."));
        Member target = memberRepository.findById(dto.getTargetFreelancerId())
                .orElseThrow(() -> new IllegalArgumentException("리뷰 대상 회원을 찾을 수 없습니다."));

        Review review = Review.builder()
                .projectId(dto.getProjectId())
                .author(author)
                .targetUser(target)
                .rating(dto.getRating())
                .title(dto.getTitle())
                .content(dto.getContent())
                .build();

        Review saved = reviewRepository.save(review);
        return ReviewResponseDto.fromEntity(saved);
    }

    /** 리뷰 수정 */
    public ReviewResponseDto updateReview(Long reviewId, Long authorId, ReviewRequestDto dto) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getAuthor().getId().equals(authorId)) {
            throw new SecurityException("본인만 리뷰를 수정할 수 있습니다.");
        }

        review.setTitle(dto.getTitle());
        review.setContent(dto.getContent());
        review.setRating(dto.getRating());

        Review updated = reviewRepository.save(review);
        return ReviewResponseDto.fromEntity(updated);
    }

    /** 리뷰 삭제 */
    public void deleteReview(Long reviewId, Long authorId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getAuthor().getId().equals(authorId)) {
            throw new SecurityException("본인만 리뷰를 삭제할 수 있습니다.");
        }

        review.softDelete(); // ✅ 실제 삭제 대신 deleted = true 설정
        reviewRepository.save(review);
    }

    /** 특정 대상자의 리뷰 목록 조회 */
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByTarget(Long targetUserId) {
        return reviewRepository.findByTargetUser_Id(targetUserId)
                .stream()
                .map(ReviewResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /** 전체 리뷰 조회 */
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(ReviewResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /** 평균 평점 */
    @Transactional(readOnly = true)
    public double getAverageRating(Long targetUserId) {
        List<Review> reviews = reviewRepository.findByTargetUser_Id(targetUserId);
        return reviews.isEmpty()
                ? 0.0
                : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }
}
