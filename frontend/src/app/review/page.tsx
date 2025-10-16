"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createReview } from "@/lib/reviewApi";
import ReviewConfirmModal from "@/components/ReviewConfirmModal";

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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        ✍ 리뷰 작성하기
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            제목
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="리뷰 제목을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            내용
          </label>
          <textarea
            className="w-full border rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="리뷰 내용을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            평점 ⭐
          </label>
          <select
            className="border rounded-lg p-2"
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
          className={`w-full py-3 font-semibold rounded-lg transition-colors ${
            loading
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
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
  );
}
