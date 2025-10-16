"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReviews, deleteReview} from "@/lib/reviewApi";

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

      if (!res.ok) {
        console.error("❌ 로그인 사용자 정보를 가져오지 못했습니다:", res.status);
        return null;
      }

      const data = await res.json();
      console.log("✅ 로그인 사용자 정보:", data);
      return data.data.id;
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
      await deleteReview(reviewId);
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
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-16" style={{ marginBottom: '64px' }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-6" style={{
            fontSize: 'clamp(2.25rem, 4vw, 2.75rem)',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '24px'
          }}>
            <span style={{
              color: '#16a34a',
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>사용자 리뷰</span> 목록
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{
            color: '#6b7280',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
            maxWidth: '56rem',
            margin: '0 auto',
            lineHeight: '1.7'
          }}>
            이 사용자가 작성한 모든 리뷰를 확인할 수 있습니다.
          </p>
          
          {/* 사용자 ID 배지 */}
          <div className="mt-6 inline-block px-6 py-3 rounded-full" style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontSize: '16px',
            padding: '12px 24px',
            fontWeight: '600'
          }}>
            👤 사용자 ID: {userId}
          </div>
        </div>

        {/* 리뷰 목록 */}
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl" style={{ color: '#6b7280' }}>
              등록된 리뷰가 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out"
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
                  {/* 제목과 평점 */}
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

                  {/* 내용 */}
                  <p className="text-gray-700 text-base mb-6" style={{
                    color: '#374151',
                    fontSize: '16px',
                    marginBottom: '24px',
                    lineHeight: '1.7'
                  }}>
                    {r.content}
                  </p>

                  {/* 메타 정보 */}
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
                        <span>✍️</span>
                        <span className="font-semibold" style={{ color: '#374151' }}>
                          작성자 ID: {r.authorId}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 수정/삭제 버튼 (본인 리뷰만) */}
                  {loggedUserId && loggedUserId === r.authorId && (
                    <div className="flex gap-3 mt-6" style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '24px'
                    }}>
                      <button
                        type="button"
                        onClick={() => router.push(`/review/edit/${r.id}?targetUserId=${userId}`)}
                        className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:transform hover:scale-105"
                        style={{
                          flex: '1',
                          padding: '12px 24px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: '600',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        ✏️ 수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-out hover:transform hover:scale-105"
                        style={{
                          flex: '1',
                          padding: '12px 24px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: '600',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 통계 요약 */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}