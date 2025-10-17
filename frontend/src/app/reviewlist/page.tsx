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
  {
    id: 4,
    projectId: 104,
    authorId: 4,
    authorNickname: "최마케터",
    targetUserId: 8,
    rating: 5,
    title: "훌륭한 협업 경험",
    content:
      "프로젝트 전반에 걸쳐 체계적이고 전문적인 모습을 보여주셨습니다. 적극 추천합니다!",
    createdAt: "2024-03-12T15:20:00",
  },
  {
    id: 5,
    projectId: 105,
    authorId: 5,
    authorNickname: "정개발자",
    targetUserId: 9,
    rating: 4,
    title: "믿을 수 있는 파트너",
    content:
      "기술적으로 뛰어나고 커뮤니케이션도 원활했습니다. 다음에도 함께 일하고 싶네요.",
    createdAt: "2024-03-11T09:45:00",
  },
];

export default function AllReviewsPage() {
  const [allReviews, setAllReviews] = useState([]); // 원본 데이터
  const [reviews, setReviews] = useState([]); // 필터링/정렬된 데이터
  const [loading, setLoading] = useState(true);
  const [useHardcoded, setUseHardcoded] = useState(false);
  const [sortOrder, setSortOrder] = useState("high");
  const [filterRating, setFilterRating] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const fetchAllReviews = async () => {
    console.log('=== 리뷰 데이터 로딩 시작 ===');
    try {
      console.log('getAllReviews() 호출 중...');
      const data = await getAllReviews();
      console.log('API 응답 데이터:', data);
      console.log('데이터 타입:', typeof data);
      console.log('데이터 길이:', data?.length);
      
      if (!data || data.length === 0) {
        console.log('❌ 데이터가 비어있음 → 샘플 데이터 사용');
        setAllReviews(SAMPLE_REVIEWS);
        setReviews(SAMPLE_REVIEWS);
        setUseHardcoded(true);
      } else {
        console.log('✅ 실제 데이터 사용, 리뷰 개수:', data.length);
        setAllReviews(data);
        setReviews(data);
        setUseHardcoded(false);
      }
    } catch (error) {
      console.error('❌ 리뷰 로딩 실패!');
      console.error('에러 타입:', error.constructor.name);
      console.error('에러 메시지:', error.message);
      console.error('전체 에러:', error);
      
      // 백엔드 연결 실패 시 샘플 데이터 표시
      setAllReviews(SAMPLE_REVIEWS);
      setReviews(SAMPLE_REVIEWS);
      setUseHardcoded(true);
    } finally {
      console.log('=== 리뷰 데이터 로딩 완료 ===');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const sortReviews = (order) => {
    const sorted = [...reviews].sort((a, b) =>
      order === "high" ? b.rating - a.rating : a.rating - b.rating
    );
    setReviews(sorted);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const filterByRating = (rating) => {
    setFilterRating(rating);
    setCurrentPage(1);
    
    if (rating === "all") {
      setReviews(allReviews);
    } else {
      const filtered = allReviews.filter(r => r.rating === parseInt(rating));
      setReviews(filtered);
    }
    
    // 정렬 상태 유지
    if (sortOrder === "low") {
      setReviews(prev => [...prev].sort((a, b) => a.rating - b.rating));
    } else {
      setReviews(prev => [...prev].sort((a, b) => b.rating - a.rating));
    }
  };

  // 페이징 계산
  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f4eb',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #16a34a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          color: '#6b7280' 
        }}>
          리뷰를 불러오는 중...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f4eb'
    }}>
      {/* 메인 컨테이너 */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        backgroundColor: '#f8f4eb',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.08)'
      }}>
        {/* 헤더 섹션 */}
        <section style={{
          backgroundColor: '#f8f4eb',
          paddingTop: '100px',
          paddingBottom: '80px',
          paddingLeft: '48px',
          paddingRight: '48px'
        }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h1 style={{
                fontSize: 'clamp(2.25rem, 4vw, 2.75rem)',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                모든{' '}
                <span style={{
                  color: '#16a34a',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>리뷰</span>{' '}
                보기
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                maxWidth: '56rem',
                margin: '0 auto',
                lineHeight: '1.7'
              }}>
                신뢰할 수 있는 사용자들의 생생한 후기를 확인해보세요.
              </p>

              {useHardcoded && (
                <div style={{
                  marginTop: '24px',
                  display: 'inline-block',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  💡 실제 리뷰 데이터를 불러올 수 없어 샘플 데이터를 표시합니다
                </div>
              )}

              {/* 통계 요약 카드 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginTop: '48px',
                maxWidth: '700px',
                margin: '48px auto 0'
              }}>
                <div style={{
                  padding: '32px',
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}>
                  <div style={{
                    fontSize: '40px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '12px'
                  }}>
                    {reviews.length}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#374151',
                    fontWeight: '600'
                  }}>
                    총 리뷰 수
                  </div>
                </div>

                <div style={{
                  padding: '32px',
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}>
                  <div style={{
                    fontSize: '40px',
                    fontWeight: '800',
                    color: '#eab308',
                    marginBottom: '12px'
                  }}>
                    ⭐ {avgRating}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#374151',
                    fontWeight: '600'
                  }}>
                    평균 평점
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 필터 및 정렬 섹션 */}
        <section style={{
          backgroundColor: '#f8f4eb',
          paddingLeft: '48px',
          paddingRight: '48px',
          paddingBottom: '32px'
        }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* 평점 필터 */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', '5', '4', '3'].map(rating => (
                  <button
                    key={rating}
                    onClick={() => filterByRating(rating)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: filterRating === rating ? '#16a34a' : 'white',
                      color: filterRating === rating ? 'white' : '#374151',
                      borderRadius: '12px',
                      border: filterRating === rating ? 'none' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: filterRating === rating 
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                        : '0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={e => {
                      if (filterRating !== rating) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (filterRating !== rating) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }
                    }}
                  >
                    {rating === 'all' ? '전체' : `⭐ ${rating}점`}
                  </button>
                ))}
              </div>

              {/* 정렬 버튼 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => sortReviews("high")}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: sortOrder === "high" ? '#16a34a' : 'white',
                    color: sortOrder === "high" ? 'white' : '#374151',
                    borderRadius: '12px',
                    border: sortOrder === "high" ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: sortOrder === "high" 
                      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                      : '0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={e => {
                    if (sortOrder !== "high") {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (sortOrder !== "high") {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }
                  }}
                >
                  📈 높은 평점순
                </button>
                <button
                  onClick={() => sortReviews("low")}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: sortOrder === "low" ? '#16a34a' : 'white',
                    color: sortOrder === "low" ? 'white' : '#374151',
                    borderRadius: '12px',
                    border: sortOrder === "low" ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: sortOrder === "low" 
                      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                      : '0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={e => {
                    if (sortOrder !== "low") {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (sortOrder !== "low") {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }
                  }}
                >
                  📉 낮은 평점순
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 리뷰 카드 리스트 */}
        <section style={{
          backgroundColor: '#f8f4eb',
          paddingTop: '32px',
          paddingBottom: '80px',
          paddingLeft: '48px',
          paddingRight: '48px'
        }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
            {reviews.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 0',
                backgroundColor: 'white',
                borderRadius: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '24px' }}>📭</div>
                <p style={{
                  fontSize: '20px',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>
                  {filterRating !== 'all' ? '해당 조건의 리뷰가 없습니다.' : '아직 등록된 리뷰가 없습니다.'}
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
                  gap: '32px'
                }}>
                  {currentReviews.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                    >
                      <div style={{ padding: '40px' }}>
                        {/* 헤더 */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '20px'
                        }}>
                          <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#111827',
                            flex: '1',
                            lineHeight: '1.3'
                          }}>
                            {r.title}
                          </h2>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginLeft: '16px',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(250, 204, 21, 0.1) 100%)',
                            border: '1px solid rgba(234, 179, 8, 0.2)'
                          }}>
                            <span style={{ fontSize: '24px' }}>⭐</span>
                            <span style={{
                              fontSize: '24px',
                              fontWeight: '800',
                              color: '#eab308'
                            }}>
                              {r.rating}
                            </span>
                          </div>
                        </div>

                        {/* 내용 */}
                        <p style={{
                          color: '#374151',
                          fontSize: '16px',
                          marginBottom: '24px',
                          lineHeight: '1.8',
                          minHeight: '96px'
                        }}>
                          {r.content}
                        </p>

                        {/* 하단 정보 */}
                        <div style={{
                          paddingTop: '20px',
                          borderTop: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: '600',
                              color: '#374151'
                            }}>
                              <span>👤</span>
                              {r.authorNickname || `User #${r.authorId}`}
                            </span>
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span>📅</span>
                              {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          <span style={{
                            padding: '6px 14px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            borderRadius: '9999px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            프로젝트 #{r.projectId}
                          </span>
                        </div>
                      </div>
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
                      onMouseEnter={e => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                      onMouseLeave={e => {
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
                          onMouseEnter={e => {
                            if (currentPage !== page) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                            }
                          }}
                          onMouseLeave={e => {
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
                      onMouseEnter={e => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                      onMouseLeave={e => {
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
        </section>
      </div>
    </div>
  );
}