"use client";

import ReviewConfirmModal from "@/components/ReviewConfirmModal";
import { createReview } from "@/lib/reviewApi";
import "@/styles/reviewStyles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function UserReviewCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const targetUserId = searchParams.get("targetUserId");
  const projectId = searchParams.get("projectId");

  console.log("✅ 받은 값:", projectId, targetUserId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ 실제 리뷰 등록 실행
  const handleSubmit = async () => {
  if (!title.trim() || !content.trim()) {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }

  if (!targetUserId || !projectId) {
    alert("리뷰 대상 사용자 또는 프로젝트 정보가 없습니다.");
    return;
  }

  const pid = Number(projectId);
  const target = Number(targetUserId);

  if (Number.isNaN(pid) || Number.isNaN(target)) {
    alert("잘못된 프로젝트 또는 사용자 정보입니다.");
    return;
  }

  setLoading(true);

  try {
    await createReview({
      title,
      content,
      rating,
      projectId: pid,
      targetUserId: target,
    });

    setShowConfirmModal(false); // ✅ 모달 닫기
    alert("리뷰가 성공적으로 등록되었습니다!");
    await new Promise((r) => setTimeout(r, 50));
    router.push(`/reviews/${targetUserId}`, { scroll: true });
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
          <h1 className="review-title">
            ✍ 리뷰 작성하기
          </h1>
        </div>

        <div className="review-form">
          <div className="review-form-group">
            <label className="review-label">
              제목
            </label>
            <input
              type="text"
              className="review-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="리뷰 제목을 입력하세요"
            />
          </div>

          <div className="review-form-group">
            <label className="review-label">
              내용
            </label>
            <textarea
              className="review-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="리뷰 내용을 입력하세요"
            />
          </div>

          <div className="review-form-group">
            <label className="review-label">
              평점 ⭐
            </label>
            <select
              className="review-input"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}점
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={loading}
            className={`review-btn ${loading ? 'review-btn:disabled' : 'review-btn-secondary'} w-full`}
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
