"use client";

import StarRating from "@/components/StarRating";
import { getReviews, updateReview } from "@/lib/reviewApi";
import "@/styles/reviewStyles.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function EditReviewPage() {
  const router = useRouter();
  const { reviewId } = useParams<{ reviewId: string }>();
  const numericReviewId = parseInt(reviewId, 10);
  const params = useSearchParams();
  const targetUserId = Number(params.get("targetUserId"));
  const isRedirecting = useRef(false);

  const [form, setForm] = useState({
    rating: 5,
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ 리뷰 데이터 불러오기
  const fetchReviewDetail = async () => {
    try {
      const reviews = await getReviews(targetUserId);
      const review = reviews.find((r: any) => r.id === numericReviewId);

      if (!review) throw new Error("해당 리뷰를 찾을 수 없습니다.");

      setForm({
        rating: review.rating,
        title: review.title,
        content: review.content,
      });
    } catch (err: any) {
      console.error("리뷰 조회 실패:", err);
      alert(err.message);
      router.push(`/reviewlist/${targetUserId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const token =
    typeof window !== "undefined" &&
    (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));

  if (!token && !isRedirecting.current) {
    isRedirecting.current = true;
    alert("로그인 후 이용해주세요.");
    router.push("/members/login");
    return;
  }

  fetchReviewDetail();
}, [numericReviewId, targetUserId]);

  // ✅ 수정 버튼 클릭 시 호출 (form submit 제거)
  const handleUpdateClick = async () => {
    setSaving(true);
    try {
      await updateReview(numericReviewId, {
        rating: Number(form.rating),
        title: form.title,
        content: form.content,
      });

      alert("리뷰가 수정되었습니다!");
      router.push(`/reviewlist/${targetUserId}`);
    } catch (err: any) {
      console.error("수정 실패:", err);
      alert(`수정 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="review-loading">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="review-container">
      <div className="review-form">
        <div className="review-header">
          <h1 className="review-title">
            리뷰 수정하기 ✏️
          </h1>
          <p className="review-subtitle">
            이전에 작성한 리뷰 내용을 수정하세요.
          </p>
          <div className="review-divider"></div>
        </div>

        <div className="space-y-6">
          <div className="review-form-group">
            <label className="review-label">
              평점
            </label>
            <StarRating
              rating={form.rating}
              onChange={(newRating) =>
                setForm((prev) => ({ ...prev, rating: newRating }))
              }
            />
          </div>

          <div className="review-form-group">
            <label className="review-label">
              제목
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="리뷰 제목을 수정하세요"
              className="review-input"
              required
            />
          </div>

          <div className="review-form-group">
            <label className="review-label">
              내용
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="리뷰 내용을 수정하세요."
              rows={6}
              className="review-textarea"
              required
            />
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleUpdateClick}
              disabled={saving}
              className={`review-btn ${saving ? '' : 'review-btn-primary'}`}
            >
              {saving ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
