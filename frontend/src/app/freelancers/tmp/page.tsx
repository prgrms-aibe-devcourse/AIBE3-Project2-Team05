"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  // 회전하는 텍스트를 위한 상태
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const rotatingTexts = ["프리랜서", "프로젝트", "AI 매칭"];

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
    <div
      className="min-h-screen flex justify-center"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* 검증된 프리랜서 섹션 */}
      <section
        className="px-4 md:px-4 lg:px-12"
        style={{
          backgroundColor: "var(--background)",
          paddingTop: "80px",
          paddingBottom: "80px",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div style={{ marginBottom: "20px" }}>
            <h1
              className="text-[26px] font-extrabold text-[#1E1B16]"
              style={{ marginBottom: "0.25rem" }}
            >
              내 프리랜서 관리하기
            </h1>
          </div>
          {/* 카드 두개 */}
          <div
            className="flex grid grid-cols-1 md:grid-cols-3 gap-10"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "40px",
            }}
          >
            {/* 카드 1 테두리, 배경 */}
            <div
              className="flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer"
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* 카드 1 내부 여백 */}
              <div className="p-8" style={{ padding: "32px" }}>
                {/* 카드 1 사진, 이름, 제목, 별점, 지역 정보 배치*/}
                <div
                  className="flex items-center gap-4 mb-4"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {/*/ 카드 1 사진 */}
                  <div
                    className="w-16 h-16 bg-gray-300 rounded-full"
                    style={{
                      width: "64px",
                      height: "64px",
                      backgroundColor: "#d1d5db",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <div>
                    <h3
                      className="font-bold text-lg text-gray-900"
                      style={{
                        fontWeight: "700",
                        fontSize: "18px",
                        color: "#111827",
                      }}
                    >
                      김민수
                    </h3>
                    <p
                      className="text-gray-600 text-sm"
                      style={{ color: "#6b7280", fontSize: "14px" }}
                    >
                      시니어 풀스택 개발자
                    </p>
                    <div
                      className="flex items-center gap-2 mt-1"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "4px",
                      }}
                    >
                      <span
                        className="text-yellow-500"
                        style={{ color: "#eab308" }}
                      >
                        ⭐ 4.9
                      </span>
                      <span
                        className="text-gray-500 text-sm"
                        style={{ color: "#6b7280", fontSize: "14px" }}
                      >
                        (47개 리뷰)
                      </span>
                      <span
                        className="text-gray-500 text-sm"
                        style={{ color: "#6b7280", fontSize: "14px" }}
                      >
                        📍 서울
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="text-right mb-4"
                  style={{ textAlign: "right", marginBottom: "16px" }}
                >
                  <div
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    ₩80,000
                  </div>
                  <div
                    className="text-sm text-gray-600"
                    style={{ fontSize: "14px", color: "#6b7280" }}
                  >
                    시간당
                  </div>
                </div>
                <p
                  className="text-gray-700 text-sm mb-4"
                  style={{
                    color: "#374151",
                    fontSize: "14px",
                    marginBottom: "16px",
                    lineHeight: "1.6",
                  }}
                >
                  7년차 풀스택 개발자로 스타트업부터 대기업까지 다양한 프로젝트
                  경험을 보유하고 있습니다. 특히 React와 Node.js를 활용한 웹
                  개발에 전문성을 가지고 있습니다.
                </p>
                <div
                  className="flex flex-wrap gap-2 mb-4"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    React
                  </span>
                  <span
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Node.js
                  </span>
                  <span
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    TypeScript
                  </span>
                  <span
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    AWS
                  </span>
                </div>
                <div
                  className="grid grid-cols-3 gap-4 mb-4 text-center text-sm"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    marginBottom: "16px",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <div
                      className="font-bold text-gray-900"
                      style={{ fontWeight: "700", color: "#111827" }}
                    >
                      156
                    </div>
                    <div className="text-gray-500" style={{ color: "#6b7280" }}>
                      완료 프로젝트
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-bold text-gray-900"
                      style={{ fontWeight: "700", color: "#111827" }}
                    >
                      1시간 이내
                    </div>
                    <div className="text-gray-500" style={{ color: "#6b7280" }}>
                      응답 시간
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-bold text-gray-900"
                      style={{ fontWeight: "700", color: "#111827" }}
                    >
                      98%
                    </div>
                    <div className="text-gray-500" style={{ color: "#6b7280" }}>
                      성공률
                    </div>
                  </div>
                </div>
                <div
                  className="flex gap-2"
                  style={{ display: "flex", gap: "8px" }}
                >
                  <span
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      borderRadius: "9999px",
                      fontSize: "14px",
                    }}
                  >
                    Top Rated
                  </span>
                  <span
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      borderRadius: "9999px",
                      fontSize: "14px",
                    }}
                  >
                    Expert Verified
                  </span>
                </div>
                <div
                  className="flex gap-2 mt-4"
                  style={{ display: "flex", gap: "8px", marginTop: "16px" }}
                >
                  <button
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{
                      flex: "1",
                      padding: "8px 16px",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    프로필 보기
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#16a34a",
                      color: "white",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    💬 메시지
                  </button>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-500 ease-out cursor-pointer"
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div className="p-8" style={{ padding: "32px" }}>
                <div
                  className="flex items-center gap-4 mb-4"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    className="w-16 h-16 bg-gray-300 rounded-full"
                    style={{
                      width: "64px",
                      height: "64px",
                      backgroundColor: "#d1d5db",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <div>
                    <h3
                      className="font-bold text-lg text-gray-900"
                      style={{
                        fontWeight: "700",
                        fontSize: "18px",
                        color: "#111827",
                      }}
                    >
                      박지영
                    </h3>
                    <p
                      className="text-gray-600 text-sm"
                      style={{ color: "#6b7280", fontSize: "14px" }}
                    >
                      UI/UX 디자이너
                    </p>
                    <div
                      className="flex items-center gap-2 mt-1"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "4px",
                      }}
                    >
                      <span
                        className="text-yellow-500"
                        style={{ color: "#eab308" }}
                      >
                        ⭐ 4.8
                      </span>
                      <span
                        className="text-gray-500 text-sm"
                        style={{ color: "#6b7280", fontSize: "14px" }}
                      >
                        (32개 리뷰)
                      </span>
                      <span
                        className="text-gray-500 text-sm"
                        style={{ color: "#6b7280", fontSize: "14px" }}
                      >
                        📍 부산
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="text-right mb-4"
                  style={{ textAlign: "right", marginBottom: "16px" }}
                >
                  <div
                    className="text-2xl font-bold text-gray-900"
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    ₩60,000
                  </div>
                  <div
                    className="text-sm text-gray-600"
                    style={{ fontSize: "14px", color: "#6b7280" }}
                  >
                    시간당
                  </div>
                </div>
                <p
                  className="text-gray-700 text-sm mb-4"
                  style={{
                    color: "#374151",
                    fontSize: "14px",
                    marginBottom: "16px",
                    lineHeight: "1.6",
                  }}
                >
                  사용자 중심의 디자인을 추구하는 UI/UX 디자이너입니다. 모바일
                  앱과 웹 서비스의 전체 디자인 프로세스를 담당하며, 사용자
                  경험을 최우선으로 생각합니다.
                </p>
                <div
                  className="flex flex-wrap gap-2 mb-4"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#fecaca",
                      color: "#991b1b",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Figma
                  </span>
                  <span
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#fecaca",
                      color: "#991b1b",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Adobe XD
                  </span>
                  <span
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#fecaca",
                      color: "#991b1b",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    프로토타이핑
                  </span>
                  <span
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#fecaca",
                      color: "#991b1b",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    사용자 리서치
                  </span>
                </div>
                <div
                  className="grid grid-cols-3 gap-4 mb-4 text-center text-sm"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    marginBottom: "16px",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <div
                      className="font-bold text-gray-900"
                      style={{ fontWeight: "700", color: "#111827" }}
                    >
                      89
                    </div>
                    <div className="text-gray-500" style={{ color: "#6b7280" }}>
                      완료 프로젝트
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-bold text-gray-900"
                      style={{ fontWeight: "700", color: "#111827" }}
                    >
                      3시간 이내
                    </div>
                    <div className="text-gray-500" style={{ color: "#6b7280" }}>
                      응답 시간
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-bold text-gray-900"
                      style={{ fontWeight: "700", color: "#111827" }}
                    >
                      96%
                    </div>
                    <div className="text-gray-500" style={{ color: "#6b7280" }}>
                      성공률
                    </div>
                  </div>
                </div>
                <div
                  className="flex gap-2"
                  style={{ display: "flex", gap: "8px" }}
                >
                  <span
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      borderRadius: "9999px",
                      fontSize: "14px",
                    }}
                  >
                    Design Expert
                  </span>
                </div>
                <div
                  className="flex gap-2 mt-4"
                  style={{ display: "flex", gap: "8px", marginTop: "16px" }}
                >
                  <button
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{
                      flex: "1",
                      padding: "8px 16px",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    프로필 보기
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#16a34a",
                      color: "white",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    💬 메시지
                  </button>
                </div>
              </div>{" "}
            </div>
          </div>
          <div className="text-center mt-16" style={{ marginTop: "64px" }}>
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:transform hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold text-base"
              style={{
                padding: "12px 24px",
                backgroundColor: "#16a34a",
                color: "white",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
            >
              모든 프리랜서 보기 →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
