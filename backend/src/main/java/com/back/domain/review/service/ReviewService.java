package com.back.domain.review.service;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.review.dto.ReviewRequestDto;
import com.back.domain.review.dto.ReviewResponseDto;
import com.back.domain.review.entity.Review;
import com.back.domain.review.repository.ReviewRepository;
import com.back.global.exception.ServiceException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository userRepository;

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

        // ✅ 평균 평점 업데이트
        updateUserAverageRating(request.getTargetUserId());

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
        updateUserAverageRating(review.getTargetUserId());

        return ReviewResponseDto.fromEntity(review);
    }

    /**
     * 리뷰 삭제 (Soft Delete)
     * // ✅ 평균 평점 업데이트
     *         updateUserAverageRating(review.getTargetUserId());
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

        updateUserAverageRating(review.getTargetUserId());
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
     * ✅ 평균 평점 계산 및 반영
     */
    @Transactional
    public void updateUserAverageRating(Long targetUserId) {
        List<Review> reviews = reviewRepository.findByTargetUserIdAndDeletedFalse(targetUserId);
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Member member = userRepository.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        member.setAverageRating(avg);
    }

    /**
     * ✅ 대상 사용자의 평균 평점을 조회
     * DB에 저장된 캐시 필드(averageRating)를 읽어오거나, 필요 시 실시간 계산
     */
    @Transactional(readOnly = true)
    public double getAverageRating(Long targetUserId) {
        Member member = userRepository.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return member.getAverageRating() != null ? member.getAverageRating() : 0.0;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getAllReviews() {
        return reviewRepository.findByDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(ReviewResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}