"use client";

import ReviewConfirmModal from "@/components/ReviewConfirmModal";
import StarRating from "@/components/StarRating"; // ⭐ 별점 컴포넌트 임포트
import { createReview } from "@/lib/reviewApi";
import "@/styles/reviewStyles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function UserReviewCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ targetFreelancerId 로 변경 (member → freelancer 반영)
  const targetFreelancerId = searchParams.get("targetUserId");
const projectId = searchParams.get("projectId");

  console.log("✅ 받은 값:", projectId, targetFreelancerId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ 리뷰 등록 실행
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!targetFreelancerId || !projectId) {
      const payload = { title, content, rating, projectId, targetFreelancerId };
      console.log("리뷰 payload", payload);
      console.log("targetFreelancerId:", targetFreelancerId);
      console.log("projectId:", projectId);
      alert("리뷰 대상 또는 프로젝트 정보가 없습니다.");
      return;
    }

    const pid = Number(projectId);
    const target = Number(targetFreelancerId);

    if (Number.isNaN(pid) || Number.isNaN(target)) {
      alert("잘못된 프로젝트 또는 대상 정보입니다.");
      return;
    }

    setLoading(true);

    try {
      await createReview({
        title,
        content,
        rating,
        projectId: pid,
        targetFreelancerId: target, // ✅ 변경된 필드 반영
      });

      setShowConfirmModal(false);
      alert("리뷰가 성공적으로 등록되었습니다!");
      await new Promise((r) => setTimeout(r, 100));
      router.push(`/reviewlist/${targetFreelancerId}`, { scroll: true });
    } catch (err: any) {
      console.error("리뷰 등록 실패:", err);
      alert(`리뷰 등록 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-container">
      <div className="review-list-container">
        <div className="review-header">
          <h1 className="review-title">✍ 리뷰 작성하기</h1>
        </div>

        <div className="review-form">
          {/* 제목 */}
          <div className="review-form-group">
            <label className="review-label">제목</label>
            <input
              type="text"
              className="review-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="리뷰 제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div className="review-form-group">
            <label className="review-label">내용</label>
            <textarea
              className="review-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="리뷰 내용을 입력하세요"
            />
          </div>

          {/* ⭐ 별점 */}
          <div className="review-form-group">
            <label className="review-label">평점</label>
            <div className="flex items-center">
              <StarRating rating={rating} onChange={(newRating) => setRating(newRating)} />
            </div>
          </div>

          {/* 등록 버튼 */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={loading}
            className={`review-btn ${
              loading ? "review-btn:disabled" : "review-btn-secondary"
            } w-full`}
          >
            {loading ? "등록 중..." : "리뷰 등록하기"}
          </button>
        </div>

        {/* ✅ 확인 모달 */}
        <ReviewConfirmModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleSubmit}
        />
      </div>
    </div>
  );
}
