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
      <div className="flex justify-center items-center h-screen" style={{ 
        backgroundColor: "var(--background)",
        color: "var(--muted-foreground)" 
      }}>
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12" style={{
      backgroundColor: "var(--background)",
      paddingTop: '80px',
      paddingBottom: '80px'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-16" style={{ marginBottom: '64px' }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-6" style={{
            fontSize: 'clamp(2.25rem, 4vw, 2.75rem)',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '24px'
          }}>
            모든 <span style={{
              color: '#16a34a',
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>리뷰</span> 보기
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{
            color: '#6b7280',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
            maxWidth: '56rem',
            margin: '0 auto',
            lineHeight: '1.7'
          }}>
            사이트 내 모든 사용자의 리뷰를 한눈에 볼 수 있습니다.
          </p>

          {useHardcoded && (
            <div className="mt-6 inline-block px-4 py-2 rounded-full text-sm" style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              fontSize: '14px',
              padding: '8px 16px'
            }}>
              💡 샘플 데이터를 표시하고 있습니다
            </div>
          )}
        </div>

        {/* 정렬 버튼 */}
        <div className="flex justify-end gap-3 mb-8">
          <button
            onClick={() => sortReviews("high")}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:transform hover:scale-105"
            style={{
              padding: '12px 24px',
              backgroundColor: sortOrder === "high" ? '#16a34a' : 'white',
              color: sortOrder === "high" ? 'white' : '#374151',
              borderRadius: '12px',
              border: sortOrder === "high" ? 'none' : '1px solid #e5e7eb',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: sortOrder === "high" 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            ⭐ 높은 평점순
          </button>
          <button
            onClick={() => sortReviews("low")}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:transform hover:scale-105"
            style={{
              padding: '12px 24px',
              backgroundColor: sortOrder === "low" ? '#16a34a' : 'white',
              color: sortOrder === "low" ? 'white' : '#374151',
              borderRadius: '12px',
              border: sortOrder === "low" ? 'none' : '1px solid #e5e7eb',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: sortOrder === "low" 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            📉 낮은 평점순
          </button>
        </div>

        {/* 리뷰 카드 리스트 */}
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl" style={{ color: '#6b7280' }}>
              아직 등록된 리뷰가 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-12">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="p-8" style={{ padding: '32px' }}>
                  <div className="flex justify-between items-start mb-4" style={{ marginBottom: '16px' }}>
                    <h2 className="text-xl font-bold text-gray-900" style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#111827',
                      flex: '1'
                    }}>
                      {r.title}
                    </h2>
                    <div className="flex items-center gap-2 ml-4" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginLeft: '16px'
                    }}>
                      <span className="text-yellow-500" style={{ color: '#eab308', fontSize: '1.5rem' }}>
                        ⭐
                      </span>
                      <span className="text-2xl font-bold" style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827'
                      }}>
                        {r.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-base mb-6" style={{
                    color: '#374151',
                    fontSize: '16px',
                    marginBottom: '24px',
                    lineHeight: '1.7'
                  }}>
                    {r.content}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t" style={{
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div className="flex items-center gap-4 text-sm" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>👤</span>
                        <span className="font-semibold" style={{ color: '#374151' }}>
                          {r.authorNickname || `User #${r.authorId}`}
                        </span>
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm" style={{
                      padding: '6px 14px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      프로젝트 #{r.projectId}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 통계 카드 */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-12" style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            padding: '32px',
            marginTop: '48px'
          }}>
            <h3 className="text-2xl font-bold text-center mb-8" style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '32px'
            }}>
              리뷰 통계
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 hover:transform hover:scale-105 transition-all duration-300 ease-out" style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(22, 163, 74, 0.1)'
              }}>
                <div className="text-4xl font-bold mb-2" style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '8px'
                }}>
                  {reviews.length}
                </div>
                <div className="text-sm font-semibold" style={{
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  총 리뷰 수
                </div>
              </div>

              <div className="p-6 hover:transform hover:scale-105 transition-all duration-300 ease-out" style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(250, 204, 21, 0.05) 100%)',
                border: '1px solid rgba(234, 179, 8, 0.1)'
              }}>
                <div className="text-4xl font-bold mb-2" style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#eab308',
                  marginBottom: '8px'
                }}>
                  {(
                    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                  ).toFixed(1)}
                </div>
                <div className="text-sm font-semibold" style={{
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  평균 평점
                </div>
              </div>

              <div className="p-6 hover:transform hover:scale-105 transition-all duration-300 ease-out" style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(22, 163, 74, 0.1)'
              }}>
                <div className="text-4xl font-bold mb-2" style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '8px'
                }}>
                  {reviews.filter((r) => r.rating === 5).length}
                </div>
                <div className="text-sm font-semibold" style={{
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  ⭐ 5점 리뷰
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}