"use client";

import { deleteReview, getReviews } from "@/lib/reviewApi";
import "@/styles/reviewStyles.css";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserReviewListPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedUserId, setLoggedUserId] = useState<number | null>(null);

  const fetchLoggedUser = async () => {
  try {
    const res = await fetch("http://localhost:8080/member/me", {
      credentials: "include", // ✅ 쿠키를 함께 보냄
    });

    if (!res.ok) {
      console.error("❌ 로그인 사용자 정보를 가져오지 못했습니다:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("✅ 로그인 사용자 정보:", data);
    return data.data.id; // RsData<MemberDto> 구조니까 data.id로 접근
  } catch (err) {
    console.error("❌ /member/me 호출 실패:", err);
    return null;
  }
};

  const fetchUserReviews = async () => {
    try {
      if (!userId) return;
      const data = await getReviews(Number(userId));
      setReviews(data);
    } catch (err: any) {
      console.error("리뷰 불러오기 실패:", err);
      alert("리뷰를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
  if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;

  try {
    await deleteReview(reviewId); // ✅ 여기서 reviewId가 제대로 전달되어야 함
    alert("리뷰가 삭제되었습니다.");
    fetchUserReviews();
  } catch (err: any) {
    console.error("삭제 실패:", err);
    alert(`삭제 실패: ${err.message}`);
  }
};

  useEffect(() => {
    const init = async () => {
      const uid = await fetchLoggedUser();
      setLoggedUserId(uid);
      await fetchUserReviews();
    };
    init();
  }, [userId]);

  if (loading) {
    return (
      <div className="review-loading">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="review-container">
      <div className="review-list-container">
        <div className="review-header">
          <h1 className="review-title">
            {userId}번 사용자의 리뷰 ✨
          </h1>
          <p className="review-subtitle">
            이 사용자가 작성한 모든 리뷰를 확인할 수 있습니다.
          </p>
          <div className="review-divider"></div>
        </div>
    
        {reviews.length === 0 ? (
          <div className="review-empty">
            <div className="review-empty-icon">📭</div>
            <p>등록된 리뷰가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((r) => (
              <div key={r.id} className="review-item">
                <div className="review-item-header">
                  <h2 className="review-item-title">{r.title}</h2>
                  <div className="review-rating">
                    <span className="review-star">⭐</span>
                    <span>{r.rating}</span>
                  </div>
                </div>
                <p className="review-content">{r.content}</p>
                <div className="review-meta">
                  <div className="review-date">
                    <span className="review-date-icon">📅</span>
                    <span>작성일: {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="review-author">
                    <span className="review-author-icon">👤</span>
                    <span>작성자 ID: {r.authorId}</span>
                  </div>
                </div>

                {loggedUserId && loggedUserId === r.authorId && (
                  <div className="review-actions">
                    <button
                      type="button"
                      onClick={() => router.push(`/review/edit/${r.id}?targetUserId=${userId}`)}
                      className="review-btn review-btn-secondary"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="review-btn review-btn-danger"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
