"use client";

import { useEffect, useState } from "react";
import { getAllReviews } from "@/lib/reviewApi";

const SAMPLE_REVIEWS = [
  {
    id: 1,
    projectId: 101,
    authorId: 1,
    authorNickname: "김개발",
    targetUserId: 5,
    rating: 5,
    title: "최고의 프리랜서였습니다!",
    content:
      "소통이 빠르고 결과물의 퀄리티가 정말 뛰어났습니다. 다음 프로젝트에도 꼭 함께하고 싶어요.",
    createdAt: "2024-03-15T10:30:00",
  },
  {
    id: 2,
    projectId: 102,
    authorId: 2,
    authorNickname: "이디자인",
    targetUserId: 6,
    rating: 4,
    title: "만족스러운 협업이었습니다",
    content:
      "전문성이 돋보이는 작업이었고, 일정도 잘 지켜주셨습니다. 다만 초기 커뮤니케이션이 조금 아쉬웠어요.",
    createdAt: "2024-03-14T14:20:00",
  },
  {
    id: 3,
    projectId: 103,
    authorId: 3,
    authorNickname: "박기획",
    targetUserId: 7,
    rating: 5,
    title: "완벽한 프로젝트 진행",
    content:
      "요구사항을 정확히 이해하고 기대 이상의 결과를 만들어주셨습니다. 프로페셔널한 태도가 인상적이었어요!",
    createdAt: "2024-03-13T09:15:00",
  },
];

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useHardcoded, setUseHardcoded] = useState(false);
  const [sortOrder, setSortOrder] = useState<"high" | "low">("high");

  const fetchAllReviews = async () => {
    try {
      const data = await getAllReviews();
      if (!data || data.length === 0) {
        setReviews(SAMPLE_REVIEWS);
        setUseHardcoded(true);
      } else {
        setReviews(data);
        setUseHardcoded(false);
      }
    } catch {
      setReviews(SAMPLE_REVIEWS);
      setUseHardcoded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const sortReviews = (order: "high" | "low") => {
    const sorted = [...reviews].sort((a, b) =>
      order === "high" ? b.rating - a.rating : a.rating - b.rating
    );
    setReviews(sorted);
    setSortOrder(order);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto p-6 py-12 space-y-8"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        borderRadius: "16px",
      }}
    >
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          모든 리뷰 보기 🗂️
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          사이트 내 모든 사용자의 리뷰를 한눈에 볼 수 있습니다.
        </p>
        <div
          className="mt-4 mx-auto rounded-full"
          style={{
            height: "4px",
            width: "100px",
            background: "var(--primary)",
          }}
        ></div>

        {useHardcoded && (
          <div
            className="mt-4 inline-block border text-sm px-4 py-2 rounded-lg"
            style={{
              background: "var(--secondary)",
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            💡 샘플 데이터를 표시하고 있습니다
          </div>
        )}
      </div>

      {/* 정렬 버튼 */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={() => sortReviews("high")}
          className="px-4 py-2 rounded-lg font-semibold transition-all"
          style={{
            background:
              sortOrder === "high" ? "var(--accent)" : "var(--secondary)",
            color:
              sortOrder === "high"
                ? "var(--accent-foreground)"
                : "var(--foreground)",
            boxShadow:
              sortOrder === "high"
                ? "0 2px 8px rgba(252,200,0,0.25)"
                : "none",
          }}
        >
          ⭐ 높은 평점순
        </button>
        <button
          onClick={() => sortReviews("low")}
          className="px-4 py-2 rounded-lg font-semibold transition-all"
          style={{
            background:
              sortOrder === "low" ? "var(--primary)" : "var(--secondary)",
            color:
              sortOrder === "low"
                ? "var(--primary-foreground)"
                : "var(--foreground)",
            boxShadow:
              sortOrder === "low"
                ? "0 2px 8px rgba(22,163,74,0.25)"
                : "none",
          }}
        >
          📉 낮은 평점순
        </button>
      </div>

      {/* 리뷰 카드 리스트 */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
            아직 등록된 리뷰가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-6 border transition-all hover:shadow-md"
              style={{
                background: "var(--card)",
                color: "var(--card-foreground)",
                borderColor: "var(--border)",
                borderRadius: "14px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold">{r.title}</h2>
                <div className="flex items-center gap-1">
                  <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>
                    ⭐
                  </span>
                  <span className="text-lg font-bold">{r.rating}</span>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed">
                {r.content}
              </p>

              <div
                className="flex justify-between items-center text-sm pt-3 border-t"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)",
                }}
              >
                <div className="flex items-center gap-4">
                  <span>📅 {new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                  <span>👤 {r.authorNickname || `User #${r.authorId}`}</span>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "var(--muted)",
                    color: "var(--primary)",
                    fontWeight: 600,
                  }}
                >
                  프로젝트 #{r.projectId}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 통계 카드 */}
      {reviews.length > 0 && (
        <div
          className="rounded-xl p-6 mt-8"
          style={{
            background: "var(--secondary)",
            color: "var(--foreground)",
          }}
        >
          <div className="flex justify-around text-center">
            <div>
              <div className="text-3xl font-bold text-[var(--primary)]">
                {reviews.length}
              </div>
              <div className="text-sm text-[var(--muted-foreground)] mt-1">
                총 리뷰 수
              </div>
            </div>
            <div className="border-l border-[var(--border)]"></div>
            <div>
              <div className="text-3xl font-bold text-[var(--accent)]">
                {(
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-[var(--muted-foreground)] mt-1">
                평균 평점
              </div>
            </div>
            <div className="border-l border-[var(--border)]"></div>
            <div>
              <div className="text-3xl font-bold text-[var(--primary)]">
                {reviews.filter((r) => r.rating === 5).length}
              </div>
              <div className="text-sm text-[var(--muted-foreground)] mt-1">
                ⭐ 5점 리뷰
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
