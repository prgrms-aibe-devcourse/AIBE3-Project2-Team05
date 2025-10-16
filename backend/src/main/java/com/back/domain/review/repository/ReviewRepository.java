package com.back.domain.review.repository;

import com.back.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ✅ targetUser 기준 (Member 관계)
    List<Review> findByTargetUser_Id(Long targetUserId);

    // ✅ 삭제되지 않은 리뷰 최신순
    List<Review> findByTargetUser_IdAndDeletedFalseOrderByCreatedAtDesc(Long targetUserId);

    // ✅ 특정 유저의 모든 리뷰 (평균 계산용)
    List<Review> findByTargetUser_IdAndDeletedFalse(Long targetUserId);

    // ✅ 전체 리뷰 중 삭제되지 않은 것 최신순
    List<Review> findByDeletedFalseOrderByCreatedAtDesc();
}
