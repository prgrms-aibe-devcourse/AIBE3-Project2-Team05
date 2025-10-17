package com.back.domain.review.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.review.dto.ReviewRequestDto;
import com.back.domain.review.dto.ReviewResponseDto;
import com.back.domain.review.entity.Review;
import com.back.domain.review.repository.ReviewRepository;
import com.back.global.exception.ServiceException;
import com.back.global.exception.UnauthorizedException;
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
    private final FreelancerRepository freelancerRepository;

    /** 리뷰 생성 */
    public ReviewResponseDto createReview(Long authorId, ReviewRequestDto dto) {
        // ✅ 작성자 = 항상 PM
        Member author = memberRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("작성자 회원을 찾을 수 없습니다."));

        Member target; // 리뷰 대상

        // ✅ 프리랜서가 존재하면 → 프리랜서에게 리뷰
        if (dto.getTargetFreelancerId() != null) {
            Freelancer freelancer = freelancerRepository.findById(dto.getTargetFreelancerId())
                    .orElse(null);

            if (freelancer != null && freelancer.getMember() != null) {
                target = freelancer.getMember(); // 프리랜서 소속 Member
            } else {
                // ❗ 프리랜서가 없으면 → PM 자신에게 리뷰
                target = author;
            }

        } else {
            // ✅ 프리랜서 ID 자체가 없으면 → PM 자신에게 리뷰
            target = author;
        }

        Review review = Review.builder()
                .projectId(dto.getProjectId())
                .author(author)       // 리뷰 작성자 (PM)
                .targetUser(target)   // 프리랜서 or 자기 자신
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
    @Transactional
    public void deleteReview(Long reviewId, Long memberId) {
        System.out.println("🧩 삭제 요청 들어옴: reviewId=" + reviewId + ", memberId=" + memberId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ServiceException("404", "리뷰를 찾을 수 없습니다."));

        System.out.println("✅ 삭제 대상 리뷰 존재: " + review.getId() + " / deleted=" + review.isDeleted());

        if (!review.getAuthor().getId().equals(memberId)) {
            throw new UnauthorizedException("401-2", "본인만 리뷰를 삭제할 수 있습니다.");
        }

        review.softDelete();
        reviewRepository.saveAndFlush(review);

        System.out.println("🔥 리뷰 삭제 완료: " + review.getId());
    }

    /** 특정 대상자의 리뷰 목록 조회 */
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByTarget(Long targetUserId) {
        return reviewRepository
                .findByTargetUser_IdAndDeletedFalseOrderByCreatedAtDesc(targetUserId)
                .stream()
                .map(ReviewResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /** 전체 리뷰 조회 */
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getAllReviews() {
        return reviewRepository
                .findByDeletedFalseOrderByCreatedAtDesc()
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
