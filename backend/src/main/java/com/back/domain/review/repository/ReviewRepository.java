package com.back.domain.review.repository;

import com.back.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ✅ targetUserId 기준으로 삭제되지 않은 리뷰들을 최신순으로 조회
    List<Review> findByTargetUserIdAndDeletedFalseOrderByCreatedAtDesc(Long targetUserId);

    // ✅ 특정 프리랜서의 모든 리뷰 (평균 계산용)
    List<Review> findByTargetUserIdAndDeletedFalse(Long targetUserId);

    // ✅ 삭제되지 않은 모든 리뷰 최신순 조회
    List<Review> findByDeletedFalseOrderByCreatedAtDesc();
}