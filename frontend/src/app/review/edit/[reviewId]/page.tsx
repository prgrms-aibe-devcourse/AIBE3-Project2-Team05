"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import StarRating from "@/components/StarRating";
import { updateReview, getReviews } from "@/lib/reviewApi";
import { useRef } from "react";

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
    const cookieHasToken = document.cookie.includes("accessToken=");
  if (!cookieHasToken && !isRedirecting.current) {
    isRedirecting.current = true; // ✅ 한 번만 실행되도록
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
      <div className="flex justify-center items-center h-screen text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-b from-white to-green-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 transition-all duration-500 hover:shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            리뷰 수정하기 ✏️
          </h1>
          <p className="text-gray-500 text-lg">
            이전에 작성한 리뷰 내용을 수정하세요.
          </p>
          <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-green-500 to-green-400 rounded-full"></div>
        </div>

        {/* ✅ form 대신 div로 감싸서 submit 완전히 제거 */}
        <div className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              평점
            </label>
            <StarRating
              rating={form.rating}
              onChange={(newRating) =>
                setForm((prev) => ({ ...prev, rating: newRating }))
              }
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              제목
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="리뷰 제목을 수정하세요"
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              내용
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="리뷰 내용을 수정하세요."
              rows={6}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition resize-none"
              required
            />
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleUpdateClick} // ✅ form submit 대신 직접 실행
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
