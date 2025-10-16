"use client";

import { useUser } from '@/app/context/UserContext';
import { useEffect, useState } from "react";
import { getAllReviews } from "@/lib/reviewApi";

export default function HomePage() {
  const { username, isLoaded } = useUser();
  
  // 회전하는 텍스트를 위한 상태
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const rotatingTexts = ["프리랜서", "프로젝트", "전문 매칭"];

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

  // 텍스트 자동 회전 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

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
              <span
                className={`inline-block transition-all duration-700 ease-out ${
                  isAnimating ? 'transform scale-110 opacity-0' : 'transform scale-100 opacity-100'                }`}
                style={{
                  color: '#16a34a',
                  display: 'inline-block',
                  minWidth: '200px',
                  textAlign: 'center',
                  fontWeight: '800',
                  textShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transform: isAnimating ? 'translateY(-10px) scale(1.1)' : 'translateY(0) scale(1)',
                  transition: 'all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}
              >
                {rotatingTexts[currentTextIndex]}
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

        {/* 검증된 프리랜서 섹션 */}
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
                검증된 <span style={{
                  color: '#16a34a',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>프리랜서</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{
                color: '#6b7280',
                fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                maxWidth: '56rem',
                margin: '0 auto',
                lineHeight: '1.7'
              }}>
                전문성과 신뢰성을 인정받은 우수한 프리랜서를 만나보세요.
              </p>
            </div>            <div className="grid grid-cols-1 md:grid-cols-3 gap-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px' }}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div className="p-8" style={{ padding: '32px' }}>
                  <div className="flex items-center gap-4 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div className="w-16 h-16 bg-gray-300 rounded-full" style={{ width: '64px', height: '64px', backgroundColor: '#d1d5db', borderRadius: '50%' }}></div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900" style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}>김민수</h3>
                      <p className="text-gray-600 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>시니어 풀스택 개발자</p>
                      <div className="flex items-center gap-2 mt-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className="text-yellow-500" style={{ color: '#eab308' }}>⭐ 4.9</span>
                        <span className="text-gray-500 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>(47개 리뷰)</span>
                        <span className="text-gray-500 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>📍 서울</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mb-4" style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <div className="text-2xl font-bold text-gray-900" style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>₩80,000</div>
                    <div className="text-sm text-gray-600" style={{ fontSize: '14px', color: '#6b7280' }}>시간당</div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4" style={{ color: '#374151', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                    7년차 풀스택 개발자로 스타트업부터 대기업까지 다양한 프로젝트 경험을 보유하고 있습니다. 특히 React와 Node.js를 활용한 웹 개발에 전문성을 가지고 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>React</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>Node.js</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>TypeScript</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>AWS</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center text-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>156</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>완료 프로젝트</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>1시간 이내</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>응답 시간</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>98%</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>성공률</div>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm" style={{
                      padding: '4px 12px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '14px'
                    }}>Top Rated</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm" style={{
                      padding: '4px 12px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '9999px',
                      fontSize: '14px'
                    }}>Expert Verified</span>
                  </div>
                  <div className="flex gap-2 mt-4" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" style={{
                      flex: '1',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}>
                      프로필 보기
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" style={{
                      padding: '8px 16px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}>
                      💬 메시지
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div className="p-8" style={{ padding: '32px' }}>
                  <div className="flex items-center gap-4 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div className="w-16 h-16 bg-gray-300 rounded-full" style={{ width: '64px', height: '64px', backgroundColor: '#d1d5db', borderRadius: '50%' }}></div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900" style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}>박지영</h3>
                      <p className="text-gray-600 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>UI/UX 디자이너</p>
                      <div className="flex items-center gap-2 mt-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className="text-yellow-500" style={{ color: '#eab308' }}>⭐ 4.8</span>
                        <span className="text-gray-500 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>(32개 리뷰)</span>
                        <span className="text-gray-500 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>📍 부산</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mb-4" style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <div className="text-2xl font-bold text-gray-900" style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>₩60,000</div>
                    <div className="text-sm text-gray-600" style={{ fontSize: '14px', color: '#6b7280' }}>시간당</div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4" style={{ color: '#374151', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                    사용자 중심의 디자인을 추구하는 UI/UX 디자이너입니다. 모바일 앱과 웹 서비스의 전체 디자인 프로세스를 담당하며, 사용자 경험을 최우선으로 생각합니다.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#fecaca',
                      color: '#991b1b',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>Figma</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#fecaca',
                      color: '#991b1b',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>Adobe XD</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#fecaca',
                      color: '#991b1b',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>프로토타이핑</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#fecaca',
                      color: '#991b1b',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>사용자 리서치</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center text-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>89</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>완료 프로젝트</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>3시간 이내</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>응답 시간</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>96%</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>성공률</div>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm" style={{
                      padding: '4px 12px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '14px'
                    }}>Design Expert</span>
                  </div>
                  <div className="flex gap-2 mt-4" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" style={{
                      flex: '1',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}>
                      프로필 보기
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" style={{
                      padding: '8px 16px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}>
                      💬 메시지
                    </button>
                  </div>
                </div>              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div className="p-8" style={{ padding: '32px' }}>
                  <div className="flex items-center gap-4 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div className="w-16 h-16 bg-gray-300 rounded-full" style={{ width: '64px', height: '64px', backgroundColor: '#d1d5db', borderRadius: '50%' }}></div>                    <div>
                      <h3 className="font-bold text-lg text-gray-900" style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}>이준호</h3>
                      <p className="text-gray-600 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>브랜드 디자이너</p>
                      <div className="flex items-center gap-2 mt-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className="text-yellow-500" style={{ color: '#eab308' }}>⭐ 4.7</span>
                        <span className="text-gray-500 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>(28개 리뷰)</span>
                        <span className="text-gray-500 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>📍 대구</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mb-4" style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <div className="text-2xl font-bold text-gray-900" style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>₩50,000</div>
                    <div className="text-sm text-gray-600" style={{ fontSize: '14px', color: '#6b7280' }}>시간당</div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4" style={{ color: '#374151', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                    10년 이상의 브랜드 디자인 경험을 바탕으로 기업의 아이덴티티를 구축하는 전문가입니다. 로고부터 전체 브랜드 가이드라인까지 종합적인 브랜드 솔루션을 제공합니다.
                  </p>                  <div className="flex flex-wrap gap-2 mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#e9d5ff',
                      color: '#6b21a8',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>브랜딩</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#e9d5ff',
                      color: '#6b21a8',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>로고 디자인</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs" style={{
                      padding: '4px 8px',
                      backgroundColor: '#e9d5ff',
                      color: '#6b21a8',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>인쇄물</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs" style={{
                      padding: '4px 8px',                      backgroundColor: '#e9d5ff',
                      color: '#6b21a8',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>Adobe Creative</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center text-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>73</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>완료 프로젝트</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>2시간 이내</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>응답 시간</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontWeight: '700', color: '#111827' }}>94%</div>
                      <div className="text-gray-500" style={{ color: '#6b7280' }}>성공률</div>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm" style={{
                      padding: '4px 12px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '14px'
                    }}>Brand Specialist</span>
                  </div>
                  <div className="flex gap-2 mt-4" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" style={{
                      flex: '1',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}>
                      프로필 보기
                    </button>                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" style={{
                      padding: '8px 16px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}>
                      💬 메시지
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-16" style={{ marginTop: '64px' }}>
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:transform hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold text-base" style={{
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
              }}>
                모든 프리랜서 보기 →
              </button>
            </div>
          </div>
        </section>

        {/* 고객 이용후기 섹션 */}
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
                고객 <span style={{
                  color: '#16a34a',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>이용후기</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px' }}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                padding: '32px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div className="mb-4" style={{ marginBottom: '16px' }}>
                  <p className="text-gray-700 mb-4" style={{ color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>
                    &ldquo;좋은 파트너를 만났습니다. 컨설팅 기간 동안 디자인 전체 과정을 체계적으로 습득할 수 있었고, 사업자 입장에서 알맞은 디자인 작업을 진행, 상담하며 체크사 의견도 잘 수렴 하셨습니다.&rdquo;
                  </p>
                  <div className="flex items-center mb-2" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="flex text-yellow-500 mr-2" style={{ display: 'flex', color: '#eab308', marginRight: '8px' }}>
                      ⭐⭐⭐⭐⭐
                    </div>
                    <span className="text-sm text-gray-600" style={{ fontSize: '14px', color: '#6b7280' }}>5.0</span>
                  </div>
                  <div className="text-right text-sm text-gray-500" style={{ textAlign: 'right', fontSize: '14px', color: '#6b7280' }}>
                    벤츠로
                  </div>
                </div>
                <div className="w-full h-48 bg-gray-200 rounded-lg" style={{
                  width: '100%',
                  height: '192px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '8px',
                  backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'                }}>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                padding: '32px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div className="mb-4" style={{ marginBottom: '16px' }}>
                  <p className="text-gray-700 mb-4" style={{ color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>
                    &ldquo;컵찬하고 진청한 바우처 프리랜서를 만나 대화와 조우 과정이 값지고 짜임새있게 학무착했습니다. 상필적 이해관계를 더 질시 과정중에 머무르지 않고 혼시단계별로 질서정연한 참금을 할 수 있었습니다.&rdquo;
                  </p>
                  <div className="flex items-center mb-2" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="flex text-yellow-500 mr-2" style={{ display: 'flex', color: '#eab308', marginRight: '8px' }}>
                      ⭐⭐⭐⭐⭐
                    </div>
                    <span className="text-sm text-gray-600" style={{ fontSize: '14px', color: '#6b7280' }}>5.0</span>
                  </div>
                  <div className="text-right text-sm text-gray-500" style={{ textAlign: 'right', fontSize: '14px', color: '#6b7280' }}>
                    플젤시스
                  </div>
                </div>
                <div className="w-full h-48 bg-gray-200 rounded-lg" style={{
                  width: '100%',
                  height: '192px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '8px',
                  backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer" style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                padding: '32px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div className="mb-4" style={{ marginBottom: '16px' }}>
                  <p className="text-gray-700 mb-4" style={{ color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>
                    &ldquo;파트너사 찾기가 쉽지 않았는데 프리모아 덕분에 좋은 업체들을 추천 받고 비교할 수 있어서 많은 도움이 되었습니다. 저희 브랜드에 가장 핏한 파트너를 찾을 수 있었습니다.&rdquo;
                  </p>
                  <div className="flex items-center mb-2" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="flex text-yellow-500 mr-2" style={{ display: 'flex', color: '#eab308', marginRight: '8px' }}>
                      ⭐⭐⭐⭐⭐
                    </div>
                    <span className="text-sm text-gray-600" style={{ fontSize: '14px', color: '#6b7280' }}>4.9</span>
                  </div>
                  <div className="text-right text-sm text-gray-500" style={{ textAlign: 'right', fontSize: '14px', color: '#6b7280' }}>
                    디자인연구소
                  </div>
                </div>
                <div className="w-full h-48 bg-gray-200 rounded-lg" style={{
                  width: '100%',
                  height: '192px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '8px',
                  backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}>
                </div>
              </div>
            </div>
            <div className="text-center mt-16" style={{ marginTop: '64px' }}>
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:transform hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold text-base" style={{
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
              }}>
                전체보기 →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}