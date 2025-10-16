// ✅ 수정 완료 버전
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import StarRating from "@/components/StarRating";
import { updateReview, getReviews } from "@/lib/reviewApi";
import { useRef } from "react";

export default function EditReviewPage() {
  const router = useRouter();
  const { reviewId } = useParams<{ reviewId: string }>();
  const targetUserId = Number(useSearchParams().get("targetUserId"));
  const numericReviewId = Number(reviewId);

  const [form, setForm] = useState({
    rating: 5,
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      alert("리뷰를 불러오는 중 오류가 발생했습니다.");
      router.push(`/reviewlist/${targetUserId}`);
    } finally {
      setLoading(false);
    }
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const cookieHasToken = document.cookie.includes("accessToken=");
  if (!cookieHasToken) {
    alert("로그인 후 이용해주세요.");
    router.replace("/members/login");
    return;
  }
  fetchReviewDetail();
}, []);


  // ✅ 버튼 클릭 시 직접 실행 (form 제거)
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
      alert("로그인 후 이용해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-4">리뷰 수정하기 ✏️</h1>
      <div className="mb-4">
        <label className="block mb-2">평점</label>
        <StarRating
          rating={form.rating}
          onChange={(newRating) =>
            setForm((prev) => ({ ...prev, rating: newRating }))
          }
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">제목</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">내용</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          rows={5}
        />
      </div>
      <button
        type="button" // ✅ form 기본 submit 막기
        disabled={saving}
        onClick={handleUpdateClick}
        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        {saving ? "수정 중..." : "수정 완료"}
      </button>
    </div>
  );
}
