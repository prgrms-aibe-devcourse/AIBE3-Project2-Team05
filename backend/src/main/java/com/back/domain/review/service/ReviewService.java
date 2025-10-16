package com.back.domain.review.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.review.dto.ReviewRequestDto;
import com.back.domain.review.dto.ReviewResponseDto;
import com.back.domain.review.entity.Review;
import com.back.domain.review.repository.ReviewRepository;
import com.back.global.exception.ServiceException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final FreelancerRepository freelancerRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 리뷰 등록
     */
    @Transactional
    public ReviewResponseDto createReview(Long authorId, ReviewRequestDto request) {
        Review review = Review.builder()
                .projectId(request.getProjectId())
                .authorId(authorId)
                .targetUserId(request.getTargetUserId())
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        reviewRepository.save(review);

        // ✅ 평균 평점 업데이트 (Freelancer 기준)
        updateFreelancerAverageRating(request.getTargetUserId());

        return ReviewResponseDto.fromEntity(review);
    }

    /**
     * 리뷰 수정
     */
    @Transactional
    public ReviewResponseDto updateReview(Long reviewId, Long authorId, ReviewRequestDto request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));

        if (!review.getAuthorId().equals(authorId)) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setContent(request.getContent());
        reviewRepository.save(review);

        // ✅ 평균 평점 업데이트
        updateFreelancerAverageRating(review.getTargetUserId());

        return ReviewResponseDto.fromEntity(review);
    }

    /**
     * 리뷰 삭제 (Soft Delete 또는 실제 삭제)
     */
    @Transactional
    public void deleteReview(Long reviewId, Long requesterId) {
        System.out.println("🧩 [deleteReview 시작] reviewId=" + reviewId + ", requesterId=" + requesterId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ServiceException("404-1", "리뷰가 존재하지 않습니다."));

        System.out.println("🧩 [리뷰 정보] authorId=" + review.getAuthorId() + ", targetUserId=" + review.getTargetUserId());

        if (!review.getAuthorId().equals(requesterId)) {
            System.out.println("🚨 [삭제 실패] 작성자 불일치! authorId=" + review.getAuthorId() + ", 요청자=" + requesterId);
            throw new ServiceException("403-1", "본인이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.delete(review);
        System.out.println("✅ [삭제 성공] reviewId=" + reviewId + " 삭제 완료");

        // ✅ 프리랜서 평균 평점 갱신
        updateFreelancerAverageRating(review.getTargetUserId());
    }

    /**
     * 대상 사용자 리뷰 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByTarget(Long targetUserId) {
        return reviewRepository.findByTargetUserIdAndDeletedFalseOrderByCreatedAtDesc(targetUserId)
                .stream()
                .map(ReviewResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * ✅ 프리랜서 평균 평점 계산 및 반영
     */
    @Transactional
    public double updateFreelancerAverageRating(Long freelancerId) {
        List<Review> reviews = reviewRepository.findByTargetUserIdAndDeletedFalse(freelancerId);

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        int count = (int) reviews.size();

        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new EntityNotFoundException("프리랜서를 찾을 수 없습니다."));

        freelancer.setAverageRating(avg);
        freelancer.setReviewCount(count);
        freelancerRepository.save(freelancer);

        return avg;
    }

    /**
     * ✅ 프리랜서 평균 평점 조회
     */
    @Transactional(readOnly = true)
    public double getAverageRating(Long freelancerId) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new EntityNotFoundException("프리랜서를 찾을 수 없습니다."));

        return freelancer.getAverageRating() != null ? freelancer.getAverageRating() : 0.0;
    }

    /**
     * ✅ 전체 리뷰 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getAllReviews() {
        return reviewRepository.findByDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(ReviewResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}
