"use client";

import { deleteReview, getReviews } from "@/lib/reviewApi";
import "@/styles/reviewStyles.css";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserReviewListPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedUserId, setLoggedUserId] = useState<number | null>(null);
  const [userNickname, setUserNickname] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

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

  // ✅ 로그인한 사용자 정보 가져오기
  const fetchUserInfoFromContext = async () => {
    try {
      const res = await fetch("http://localhost:8080/member/me", {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserNickname(data.data.nickname || data.data.username);
      }
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err);
    }
  };

  const fetchUserReviews = async () => {
    try {
      if (!userId) return;
      const data = await getReviews(Number(userId));
      setAllReviews(data);
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
      await fetchUserReviews();
      setCurrentPage(1);
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
      await fetchUserInfoFromContext();
      await fetchUserReviews();
    };
    init();
  }, [userId]);

  // 페이징 계산
  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="review-loading">로딩 중...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f4eb' }}>
      <div className="review-container">
        <div className="review-list-container">
          <div className="review-header">
            <h1 className="review-title">
              {userNickname ? `${userNickname}님의 리뷰` : "리뷰 목록"}
            </h1>
            <p className="review-subtitle">
              이 프리랜서가 받은 모든 리뷰를 확인할 수 있습니다.
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="review-empty">
              <div className="review-empty-icon">🔭</div>
              <p>등록된 리뷰가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {currentReviews.map((r) => (
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
                      <div className="review-author">👤 작성자: {r.authorNickname}</div>
                    </div>

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

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div style={{
                  marginTop: '64px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  {/* 이전 버튼 */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                      color: currentPage === 1 ? '#9ca3af' : '#374151',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: currentPage === 1 ? 'none' : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      opacity: currentPage === 1 ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }
                    }}
                  >
                    ← 이전
                  </button>

                  {/* 페이지 번호들 */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: currentPage === page ? '#16a34a' : 'white',
                          color: currentPage === page ? 'white' : '#374151',
                          borderRadius: '12px',
                          border: currentPage === page ? 'none' : '1px solid #e5e7eb',
                          cursor: 'pointer',
                          fontSize: '15px',
                          fontWeight: '700',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: currentPage === page 
                            ? '0 10px 15px -3px rgba(22, 163, 74, 0.3)' 
                            : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== page) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.backgroundColor = '#f0fdf4';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== page) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* 다음 버튼 */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                      color: currentPage === totalPages ? '#9ca3af' : '#374151',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: currentPage === totalPages ? 'none' : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      opacity: currentPage === totalPages ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }
                    }}
                  >
                    다음 →
                  </button>

                  {/* 페이지 정보 */}
                  <div style={{
                    marginLeft: '12px',
                    padding: '12px 20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#6b7280',
                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}>
                    {currentPage} / {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}