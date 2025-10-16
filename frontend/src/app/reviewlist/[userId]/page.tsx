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
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data.id;
    } catch {
      return null;
    }
  };

  const fetchUserReviews = async () => {
    try {
      if (!userId) return;
      const data = await getReviews(Number(userId));
      setReviews(data);
    } catch (err) {
      console.error("리뷰 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
    try {
      await deleteReview(reviewId);
      alert("리뷰가 삭제되었습니다.");
      fetchUserReviews();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

 
  const handleEdit = (reviewId: number) => {
    if (!loggedUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    router.push(`/review/edit/${reviewId}?targetUserId=${userId}`);
  };

  useEffect(() => {
    const init = async () => {
      const uid = await fetchLoggedUser();
      setLoggedUserId(uid);
      await fetchUserReviews();
    };
    init();
  }, [userId]);

  if (loading) return <div className="review-loading">로딩 중...</div>;

  return (
    <div className="review-container">
      <div className="review-list-container">
        <div className="review-header">
          <h1 className="review-title">{userId}번 사용자의 리뷰</h1>
          <p className="review-subtitle">
            이 사용자가 작성한 모든 리뷰를 확인할 수 있습니다.
          </p>
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
                    📅 작성일: {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  <div className="review-author">👤 작성자 : {r.authorNickname}</div>
                </div>

                {/* 수정 버튼 클릭 시 로그인 확인 */}
                {loggedUserId === r.authorId && (
                  <div className="review-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(r.id)}
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