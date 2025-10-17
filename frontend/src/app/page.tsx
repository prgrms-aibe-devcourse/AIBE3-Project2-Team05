"use client";

import { useUser } from '@/app/context/UserContext';
import { apiFetch } from '@/lib/backend/client';
import { useEffect, useMemo, useState } from "react";
import { getAllReviews } from "@/lib/reviewApi";

// 이미지 처리 함수 (API에서 오는 상대 경로 또는 public 폴더 경로를 안전하게 처리)
function fullImageUrl(url?: string) {
  if (!url) return '/logo-full.png';
  // 이미 절대 URL인 경우 그대로 반환
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // public 폴더에 있는 파일 경로는 /filename.jpg 형태이므로 바로 사용
  if (url.startsWith('/')) return url;
  // 서버에서 반환하는 상대 경로(예: /uploads/xxx) 처리
  return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function HomePage() {
  const { username, isLoaded } = useUser();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  
  // 회전하는 텍스트를 위한 상태 (부드러운 슬라이드로 변경)
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const rotatingTexts = ["프리랜서", "프로젝트", "전문 매칭"];
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);


  useEffect(() => {
      apiFetch("/api/v1/freelancers")
        .then(setFreelancers)
        .catch(e => setError("데이터를 불러오지 못했습니다."))
    }, []);

    // 리뷰 데이터 가져오기
    useEffect(() => {
      const fetchReviews = async () => {
        try {
          const data = await getAllReviews();
          // 최신 3개만 표시 (평점 높은 순으로 정렬)
          const topReviews = data
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);
          setReviews(topReviews);
          setReviewsLoading(false);
        } catch (error) {
          console.error('리뷰 로딩 실패:', error);
          setReviews([]);
          setReviewsLoading(false);
        }
      };

      fetchReviews();
    }, []);


  // 프로젝트 카드 클릭 핸들러
  const handleProjectClick = (projectId: number) => {
    if (!isLoaded) return; // 로딩 중이면 대기
    
    if (!username) {
      alert('프로젝트 상세 정보를 보려면 로그인이 필요합니다.');
      window.location.href = '/members/login';
      return;
    }
    
    window.location.href = `/projects/${projectId}`;
  };

  const marqueeProfiles = useMemo(() => {
  // 데이터가 바뀔 때만 새로 만듦 (메인 타이틀 바뀔 때 영향 없음)
  return [...freelancers, ...freelancers];
}, [freelancers]);


  // 텍스트 자동 회전 효과: 인덱스만 주기적으로 바꾸고 CSS transform으로 부드럽게 이동시킵니다.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

  // 예시 프로필 데이터
const sampleProfiles = [
  {
    id: 5,
    imageUrl: "/노현정.jpg",
    nickname: "노현정",
    title: "댓글 전문가",
    location: "서울",
    techs: ["Python", "Pandas"],
  },
  {
    id: 6,
    imageUrl: "/윤주찬.jpg",
    nickname: "윤주찬",
    title: "인증 전문가",
    location: "서울",
    techs: ["TensorFlow", "PyTorch"],
  },
  {
    id: 7,
    imageUrl: "/박세웅.jpg",
    nickname: "박세웅",
    title: "프로젝트 전문가",
    location: "서울",
    techs: ["React", "Node.js"],
  },
  {
    id: 8,
    imageUrl: "/임창기.jpg",
    nickname: "임창기",
    title: "매칭 전문가",
    location: "서울",
    techs: ["React", "Node.js"],
  },
  {
    id: 9,
    imageUrl: "/주권영.jpg",
    nickname: "주권영",
    title: "프리랜서 전문가",
    location: "경기",
    techs: ["React", "Node.js"],
  },
  {
    id: 1,
    imageUrl: "",
    nickname: "김민수",
    title: "풀스택 개발자",
    location: "서울",
    techs: ["React", "Node.js"],
  },
  {
    id: 2,
    imageUrl: "",
    nickname: "박지영",
    title: "UI/UX 디자이너",
    location: "부산",
    techs: ["Figma", "Adobe XD"],
  },
  {
    id: 3,
    imageUrl: "",
    nickname: "이수진",
    title: "백엔드 개발자",
    location: "대전",
    techs: ["Node.js", "Express"],
  },
  {
    id: 4,
    imageUrl: "",
    nickname: "최지우",
    title: "프론트엔드 개발자",
    location: "인천",
    techs: ["React", "TypeScript"],
  },
];

type Profile = {
  id: number | string;
  freelancerProfileImageUrl?: string;
  nickname?: string;
  title?: string;
  location?: string;
  techs?: string[];
};

function FreelancerMarquee({ profiles }: { profiles: Profile[] }) {
  return (
    <div style={{
      width: "100%",
      overflow: "hidden",
      background: "linear-gradient(90deg,#f7f5ec 0%, #fafaf7 100%)",
      padding: "22px 0",
      borderTop: "1px solid #f3f4f6",
      position: "relative",
    }}>
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
          animation: "marquee 24s linear infinite",
          whiteSpace: 'nowrap',
          flexWrap: 'nowrap'
        }}
        onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
        onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
      >
        {profiles.map((f: Profile, idx: number) => (
          <div key={String(f.id) + "-" + idx}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: "999px",
              padding: "8px 20px 8px 10px",
              boxShadow: "0 2px 12px #0001",
              gap: "14px",
              minWidth: "0",
              border: "1px solid #f3f4f6",
              flex: '0 0 auto' // grow horizontally instead of wrapping
            }}>
            <img
              src={fullImageUrl((f as any).imageUrl || (f as any).freelancerProfileImageUrl)}
              alt={f.nickname}
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                objectFit: "cover",
                background: "#eee",
                boxShadow: "0 1px 8px #0001",
                flexShrink: 0
              }}
            />
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0
            }}>
              <div style={{
                fontWeight: 800,
                fontSize: "18px",
                color: "#222",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>{f.nickname}
              <span style={{ display: 'inline-block', color: "#888", fontSize: "13px", marginLeft: '8px' }}>📍 {f.location}</span></div>
              <div style={{
                color: "#222",
                fontWeight: 500,
                fontSize: "15px",
                marginTop: "3px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>{f.title}</div>
              {/* tech chips (up to 2) */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {(f.techs || []).slice(0,2).map((t, i) => (
                  <span key={i} style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-52%); }
        }
      `}</style>
    </div>
  );
}
 // 별점 렌더링 함수
    const renderStars = (rating) => {
      return '⭐'.repeat(rating);
    };


  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* 메인 컨테이너 */}
      <div className="mx-auto" style={{
        maxWidth: '1440px',
        margin: '0 auto',
        backgroundColor: 'var(--background)',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.08)'
      }}>
        {/* 메인 히어로 섹션 */}
        <section className="text-center px-4 md:px-8 lg:px-12" style={{
          backgroundColor: "var(--background)",
          paddingTop: '100px',
          paddingBottom: '100px'
        }}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-10" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '48px',
              lineHeight: '1.2'
            }}>
              당신이 찾는{' '}
              {/* 부드러운 슬라이드로 텍스트 전환 */}
              <span style={{
                color: '#16a34a',
                display: 'inline-block',
                minWidth: '200px',
                textAlign: 'center',
                fontWeight: '800',
                textShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
                verticalAlign: 'middle',
                overflow: 'hidden'
              }}>
                  <div style={{ display: 'inline-block', overflow: 'hidden', height: '1.2em' }}>
                    <div style={{ transform: `translateY(-${(currentTextIndex * 100) / (rotatingTexts.length || 1)}%)`, transition: 'transform 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
                      {rotatingTexts.map((t, i) => (
                        <div key={i} style={{
                          height: '1.2em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          color: '#16a34a'
                        }}>{t}</div>
                      ))}
                    </div>
                  </div>
              </span>
              <br />
              <span style={{
                color: '#16a34a',
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>FIT</span>하게 찾아드려요
            </h1>
            <p className="text-xl text-gray-600 mb-16" style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
              color: '#6b7280',
              marginBottom: '72px',
              lineHeight: '1.7'
            }}>
              전문성과 신뢰성을 인정받은 우수한 프리랜서들을 만나보세요.
            </p>
          </div>
          <FreelancerMarquee profiles={sampleProfiles} />
          <div className="text-center mt-16" style={{ marginTop: '64px' }}>
              <button 
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:transform hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold text-base" 
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
                onClick={() => window.location.href = '/freelancers'}
              >
                더 많은 프리랜서 보기
              </button>
            </div>
        </section>
        
        {/* 최신 프로젝트 섹션 */}
        <section className="px-4 md:px-8 lg:px-12" style={{
          backgroundColor: "var(--background)",
          paddingTop: '80px',
          paddingBottom: '80px'
        }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16" style={{ marginBottom: '64px' }}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6" style={{
                fontSize: 'clamp(2.25rem, 4vw, 2.75rem)',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '24px'
              }}>
                최신 <span style={{
                  color: '#16a34a',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>프로젝트</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{
                color: '#6b7280',
                fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                maxWidth: '56rem',
                margin: '0 auto',
                lineHeight: '1.7'
              }}>
                다양한 분야의 흥미로운 프로젝트들이 여러분을 기다리고 있습니다.
              </p>
            </div>            <div className="grid grid-cols-1 md:grid-cols-3 gap-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '48px' }}>
              {/* 프로젝트 1: 웹 애니메이션 라이브러리 */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => handleProjectClick(23)}
              >
                <div className="p-10" style={{ padding: '40px' }}>
                  <div className="flex justify-between items-start mb-6" style={{ marginBottom: '20px' }}>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm" style={{
                      padding: '6px 14px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '14px'
                    }}>
                      모집중
                    </span>
                    <div className="text-sm text-gray-500" style={{ fontSize: '14px', color: '#6b7280' }}>
                      2025.10.07
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-3" style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px', color: '#111827' }}>
                    웹 애니메이션 라이브러리
                  </h3>
                  <p className="text-gray-600 text-sm mb-4" style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                    CSS3와 JavaScript를 활용한 고성능 웹 애니메이션 라이브러리를 개발합니다. 사용하기 쉽고 확장 가능한 애니메이션 솔루션을 만들어보세요.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>개발</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>JavaScript</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>CSS3</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4" style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>💰 250만원</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📍 상주</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm" style={{ fontSize: '14px' }}>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="text-gray-700" style={{ color: '#374151' }}>박승규</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                      <span>👀 456</span>
                      <span>📝 9</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 프로젝트 2: AI 챗봇 개발 프로젝트 */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => handleProjectClick(24)}
              >
                <div className="p-10" style={{ padding: '40px' }}>
                  <div className="flex justify-between items-start mb-6" style={{ marginBottom: '20px' }}>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm" style={{
                      padding: '6px 14px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '14px'
                    }}>
                      모집중
                    </span>
                    <div className="text-sm text-gray-500" style={{ fontSize: '14px', color: '#6b7280' }}>
                      2025.10.05
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-3" style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px', color: '#111827' }}>
                    AI 챗봇 개발 프로젝트
                  </h3>
                  <p className="text-gray-600 text-sm mb-4" style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                    자연어 처리 기술을 활용한 고도화된 챗봇을 개발합니다. 고객 서비스 자동화와 사용자 만족도 향상을 목표로 하는 프로젝트입니다.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>개발</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>AI</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>NLP</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4" style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>💰 1,800만원</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📍 외주</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm" style={{ fontSize: '14px' }}>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="text-gray-700" style={{ color: '#374151' }}>이민호</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                      <span>👀 2,134</span>
                      <span>📝 38</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 프로젝트 3: 블록체인 투표 시스템 */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => handleProjectClick(25)}
              >
                <div className="p-10" style={{ padding: '40px' }}>
                  <div className="flex justify-between items-start mb-6" style={{ marginBottom: '20px' }}>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm" style={{
                      padding: '6px 14px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '14px'
                    }}>
                      모집중
                    </span>
                    <div className="text-sm text-gray-500" style={{ fontSize: '14px', color: '#6b7280' }}>
                      2025.10.09
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-3" style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px', color: '#111827' }}>
                    블록체인 투표 시스템
                  </h3>
                  <p className="text-gray-600 text-sm mb-4" style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                    투명하고 안전한 온라인 투표 시스템을 블록체인 기술로 구현합니다. 탈중앙화된 투표 프로세스로 신뢰성 있는 결과를 보장합니다.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>개발</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>블록체인</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>보안</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4" style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>💰 950만원</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📍 외주</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm" style={{ fontSize: '14px' }}>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="text-gray-700" style={{ color: '#374151' }}>정수현</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                      <span>👀 834</span>
                      <span>📝 16</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-16" style={{ marginTop: '64px' }}>
              <button 
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:transform hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold text-base" 
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
                onClick={() => window.location.href = '/projects'}
              >
                모든 프로젝트 보기 →
              </button>
            </div>
          </div>
        </section>

        {/* 고객 이용후기 섹션 */}
          <section style={{
            backgroundColor: '#f8f4eb',
            paddingTop: '80px',
            paddingBottom: '80px',
            paddingLeft: '48px',
            paddingRight: '48px'
          }}>
            <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                <h2 style={{
                  fontSize: 'clamp(2.25rem, 4vw, 2.75rem)',
                  fontWeight: '800',
                  color: '#111827',
                  marginBottom: '24px'
                }}>
                  고객 <span style={{
                    color: '#16a34a',
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>이용후기</span>
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                  lineHeight: '1.7'
                }}>
                  실제 사용자들의 생생한 후기를 확인해보세요.
                </p>
              </div>

              {reviewsLoading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '80px 0'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #16a34a',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : reviews.length === 0 ? (
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
                    아직 등록된 리뷰가 없습니다.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '40px'
                }}>
                  {reviews.map((review) => (
                    <div 
                      key={review.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb',
                        padding: '32px',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                    >
                      <div style={{ marginBottom: '20px' }}>
                        {/* 별점 */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '12px',
                          gap: '8px'
                        }}>
                          <div style={{
                            fontSize: '20px',
                            color: '#eab308'
                          }}>
                            {renderStars(review.rating)}
                          </div>
                          <span style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#eab308'
                          }}>
                            {review.rating}.0
                          </span>
                        </div>

                        {/* 제목 */}
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '16px',
                          lineHeight: '1.4'
                        }}>
                          {review.title}
                        </h3>

                        {/* 내용 */}
                        <p style={{
                          color: '#374151',
                          fontSize: '15px',
                          lineHeight: '1.7',
                          marginBottom: '20px',
                          minHeight: '84px'
                        }}>
                          "{review.content}"
                        </p>

                        {/* 작성자 정보 */}
                        <div style={{
                          paddingTop: '16px',
                          borderTop: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                          }}>
                            <span>👤</span>
                            <span style={{
                              fontWeight: '600',
                              color: '#374151'
                            }}>
                              {review.authorNickname || `User #${review.id}`}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>
                            {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!reviewsLoading && reviews.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '64px' }}>
                  <button 
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onClick={() => window.location.href = '/reviewlist'}
                  >
                    전체보기 →
                  </button>
                </div>
              )}
            </div>
          </section>

        {/* 통계 섹션 */}
        <section className="px-4 md:px-8 lg:px-12" style={{
          backgroundColor: "var(--background)",
          paddingTop: '80px',
          paddingBottom: '80px'
        }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
              <div className="p-8 hover:transform hover:scale-105 transition-all duration-300 ease-out" style={{
                padding: '32px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(22, 163, 74, 0.1)'
              }}>
                <div className="text-3xl font-bold text-green-600 mb-3 animate-pulse" style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '12px',
                  textShadow: '0 4px 8px rgba(22, 163, 74, 0.1)'
                }}>
                  12,847
                </div>
                <div className="text-lg font-semibold text-gray-700" style={{
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  누적 프로젝트 수
                </div>
              </div>

              <div className="p-8 hover:transform hover:scale-105 transition-all duration-300 ease-out" style={{
                padding: '32px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(22, 163, 74, 0.1)'
              }}>
                <div className="text-3xl font-bold text-green-600 mb-3 animate-pulse" style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '12px',
                  textShadow: '0 4px 8px rgba(22, 163, 74, 0.1)'
                }}>
                  8,432
                </div>
                <div className="text-lg font-semibold text-gray-700" style={{
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  누적 포트폴리오 수
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function setLoading(arg0: boolean): void {
  throw new Error('Function not implemented.');
}
function setError(arg0: string): any {
  throw new Error('Function not implemented.');
}