"use client";

import { getAllReviews } from "@/lib/reviewApi";
import "@/styles/reviewStyles.css";
import { useEffect, useState } from "react";

// ✅ 하드코딩된 샘플 리뷰 데이터
const SAMPLE_REVIEWS = [
  {
    id: 1,
    projectId: 101,
    authorId: 1,
    authorNickname: "김개발",
    targetUserId: 5,
    rating: 5,
    title: "최고의 프리랜서였습니다!",
    content: "소통이 빠르고 결과물의 퀄리티가 정말 뛰어났습니다. 다음 프로젝트에도 꼭 함께하고 싶어요.",
    createdAt: "2024-03-15T10:30:00"
  },
  {
    id: 2,
    projectId: 102,
    authorId: 2,
    authorNickname: "이디자인",
    targetUserId: 6,
    rating: 4,
    title: "만족스러운 협업이었습니다",
    content: "전문성이 돋보이는 작업이었고, 일정도 잘 지켜주셨습니다. 다만 초기 커뮤니케이션이 조금 아쉬웠어요.",
    createdAt: "2024-03-14T14:20:00"
  },
  {
    id: 3,
    projectId: 103,
    authorId: 3,
    authorNickname: "박기획",
    targetUserId: 7,
    rating: 5,
    title: "완벽한 프로젝트 진행",
    content: "요구사항을 정확히 이해하고 기대 이상의 결과를 만들어주셨습니다. 프로페셔널한 태도가 인상적이었어요!",
    createdAt: "2024-03-13T09:15:00"
  },
  {
    id: 4,
    projectId: 104,
    authorId: 4,
    authorNickname: "최마케터",
    targetUserId: 8,
    rating: 3,
    title: "보통 수준이었습니다",
    content: "요구사항은 충족했지만 기대했던 것보다는 조금 아쉬웠습니다. 그래도 성실하게 진행해주셨어요.",
    createdAt: "2024-03-12T16:45:00"
  },
  {
    id: 5,
    projectId: 105,
    authorId: 5,
    authorNickname: "정기획자",
    targetUserId: 9,
    rating: 5,
    title: "강력 추천합니다!",
    content: "기술력도 뛰어나고 문제 해결 능력이 탁월합니다. 어려운 요구사항도 척척 해결해주셨어요.",
    createdAt: "2024-03-11T11:00:00"
  },
  {
    id: 6,
    projectId: 106,
    authorId: 6,
    authorNickname: "강프로",
    targetUserId: 10,
    rating: 4,
    title: "좋은 경험이었습니다",
    content: "전반적으로 만족스러웠고, 특히 세심한 부분까지 신경써주셔서 좋았습니다.",
    createdAt: "2024-03-10T13:30:00"
  }
];

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useHardcoded, setUseHardcoded] = useState(false);
  const [sortOrder, setSortOrder] = useState<"high" | "low">("high"); // ✅ 정렬 상태

  const fetchAllReviews = async () => {
    try {
      const data = await getAllReviews();
      
      // ✅ API에서 데이터가 없으면 하드코딩 데이터 사용
      if (!data || data.length === 0) {
        setReviews(SAMPLE_REVIEWS);
        setUseHardcoded(true);
      } else {
        setReviews(data);
        setUseHardcoded(false);
      }
    } catch (err: any) {
      console.error("리뷰 전체 조회 실패:", err);
      // ✅ API 호출 실패 시에도 하드코딩 데이터 사용
      setReviews(SAMPLE_REVIEWS);
      setUseHardcoded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  // ✅ 정렬 함수
  const sortReviews = (order: "high" | "low") => {
    const sorted = [...reviews].sort((a, b) => {
      if (order === "high") {
        return b.rating - a.rating; // 높은 평점 → 낮은 평점
      } else {
        return a.rating - b.rating; // 낮은 평점 → 높은 평점
      }
    });
    setReviews(sorted);
    setSortOrder(order);
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
      <div className="review-list-container">
        <div className="review-header">
          <h1 className="review-title">
            모든 리뷰 보기 🗂️
          </h1>
          <p className="review-subtitle">
            사이트 내 모든 사용자의 리뷰를 한눈에 볼 수 있습니다.
          </p>
          <div className="review-divider"></div>
          
          {useHardcoded && (
            <div className="review-notification">
              💡 샘플 데이터를 표시하고 있습니다
            </div>
          )}
        </div>

        {/* ✅ 정렬 버튼 */}
        <div className="review-sort-buttons">
          <button
            onClick={() => sortReviews("high")}
            className={`review-sort-btn ${sortOrder === "high" ? "active" : "inactive"}`}
          >
            ⭐ 높은 평점순
          </button>
          <button
            onClick={() => sortReviews("low")}
            className={`review-sort-btn ${sortOrder === "low" ? "active" : "inactive"}`}
          >
            📉 낮은 평점순
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="review-empty">
            <div className="review-empty-icon">📭</div>
            <p>아직 등록된 리뷰가 없습니다.</p>
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
                  <div>
                    <span className="review-date">
                      <span className="review-date-icon">📅</span>
                      {new Date(r.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="review-author ml-4">
                      <span className="review-author-icon">👤</span>
                      작성자: {r.authorNickname || `User #${r.authorId}`}
                    </span>
                  </div>
                  <span className="review-project-tag">
                    프로젝트 #{r.projectId}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ 통계 정보 */}
        {reviews.length > 0 && (
          <div className="review-stats">
            <div className="review-stats-grid">
              <div className="review-stats-item">
                <div className="review-stats-number">{reviews.length}</div>
                <div className="review-stats-label">총 리뷰 수</div>
              </div>
              <div className="review-stats-divider"></div>
              <div className="review-stats-item">
                <div className="review-stats-number text-yellow-500">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </div>
                <div className="review-stats-label">평균 평점</div>
              </div>
              <div className="review-stats-divider"></div>
              <div className="review-stats-item">
                <div className="review-stats-number text-blue-600">
                  {reviews.filter(r => r.rating === 5).length}
                </div>
                <div className="review-stats-label">⭐ 5점 리뷰</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}