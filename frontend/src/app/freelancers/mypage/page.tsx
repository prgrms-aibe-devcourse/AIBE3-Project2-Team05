"use client";
import CareerAddModal from "@/components/CareerAddModal";
import CareerEditModal from "@/components/CareerEditModal";
import TechAddModal from "@/components/TechAddModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function PortfolioAddButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      style={{
        background: "#16a34a",
        color: "#fff",
        fontWeight: 700,
        border: "none",
        fontSize: "14px", // 기존보다 작게
        padding: "8px 22px", // 기존보다 작게
        borderRadius: "8px",
        boxShadow: "0 2px 8px #16a34a22",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onClick={() => router.push("/freelancers/portfolios/write")}
    >
      포트폴리오 추가
    </button>
  );
}

// 날짜 포맷 변환 함수: "2025-07-01" -> "25년 07월"
function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear().toString().slice(2); // "25"
  const month = String(d.getMonth() + 1).padStart(2, "0"); // "07"
  return `${year}년 ${month}월`;
}

// full-year format: "2025년 02월"
function formatFullDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}년 ${month}월`;
}

function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function FreelancerMyPage() {
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<any | null>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"basic" | "portfolio" | "completed" | "review">("basic");
  const [modalOpen, setModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [activePortfolioId, setActivePortfolioId] = useState<string | number | null>(null);
  const [modalPortfolio, setModalPortfolio] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [careerAddModalOpen, setCareerAddModalOpen] = useState(false);
  const [techAddModalOpen, setTechAddModalOpen] = useState(false);
  const [editCareerModalOpen, setEditCareerModalOpen] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const freelancerPromise = fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me`,
          { method: "GET", credentials: "include" }
        ).then((res) => res.json());
        const portfolioPromise = fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/portfolios`,
          { method: "GET", credentials: "include" }
        ).then((res) => res.json());
        // 리뷰, 완료프로젝트 API가 있다면 여기에 추가
        const [freelancerData, portfolioData] = await Promise.all([
          freelancerPromise,
          portfolioPromise,
        ]);
        setFreelancer(freelancerData);
        setPortfolios(portfolioData || []);
      } catch (err) {
        console.error("API 호출 중 오류 발생:", err);
      }
    };
    fetchAllData();
  }, []);

  function deleteMyFreelancer() {
    if (!freelancer) return;
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/${freelancer.id}`,
      { method: "DELETE", credentials: "include" }
    )
      .then((res) => {
        if (!res.ok) throw new Error("프리랜서를 삭제할 수 없습니다.");
        alert("프리랜서가 성공적으로 삭제되었습니다.");
        setFreelancer(null);
      })
      .catch((err) => {
        console.error(err);
        alert("오류가 발생했습니다.");
      });
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modalOpen) {
        const modal = document.getElementById("edit-modal");
        if (modal && !modal.contains(e.target as Node)) setModalOpen(false);
      }
    }
    if (modalOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [modalOpen]);

  // portfolio modal: fetch and show portfolio detail
  const openPortfolioModal = async (portfolioId: string | number) => {
    setActivePortfolioId(portfolioId);
    setPortfolioModalOpen(true);
    setModalLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/portfolios/${portfolioId}`,
        { method: "GET", credentials: "include" }
      );
      if (!res.ok) throw new Error("포트폴리오 정보를 불러올 수 없습니다.");
      const data = await res.json();
      setModalPortfolio(data);
    } catch (err) {
      console.error(err);
      setModalPortfolio(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closePortfolioModal = () => {
    setPortfolioModalOpen(false);
    setActivePortfolioId(null);
    setModalPortfolio(null);
    setModalLoading(false);
  };

  useEffect(() => {
    if (!portfolioModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePortfolioModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [portfolioModalOpen]);

  // 포트폴리오 삭제
  async function handleDeletePortfolio(portfolioId: string | number) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setModalLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/portfolios/${portfolioId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error("포트폴리오를 삭제할 수 없습니다.");
      alert("포트폴리오가 성공적으로 삭제되었습니다.");
      // 목록에서 제거
      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
      closePortfolioModal();
    } catch (err) {
      alert("삭제 실패: " + (err as Error).message);
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f5ec",
        fontFamily: "'Pretendard', 'Inter', Arial, sans-serif",
        padding: "0",
      }}
      className="flex justify-center items-start"
    >
      <div className="w-full" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 0" }}>
        {/* 제목 */}
        <div style={{ marginBottom: "34px", paddingLeft: "8px" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "#333",
              marginBottom: "10px",
              letterSpacing: "-1px",
            }}
          >
            내 프리랜서 정보
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: "32px",
            alignItems: "flex-start",
          }}
        >
          {/* 프로필 카드 - 리스트 페이지 분위기로 */}
          <div
            style={{
              background: "#fff",
              borderRadius: "13px",
              boxShadow: "0 2px 12px #0001",
              padding: "36px 32px",
              minWidth: 340,
              maxWidth: 400,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "fit-content",
            }}
          >
            <div style={{
              width: "150px", // 기존보다 조금 더 크게
              height: "150px",
              borderRadius: "22px",
              overflow: "hidden",
              background: "#f7f7f7",
              flexShrink: 0,
              boxShadow: "0 1px 10px #0001",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px auto"
            }}>
                <img
                  src={
                    freelancer?.freelancerProfileImageUrl
                      ? fullImageUrl(freelancer.freelancerProfileImageUrl)
                      : "/logo-full.png"
                  }
                  alt={freelancer?.nickname || "프리랜서"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "22px",
              marginBottom: "10px"
            }}>
            
              {/* 닉네임/타이틀 */}
              <div style={{ display: "flex", textAlign: "center", flexDirection: "column", justifyContent: "center", flex: 1 }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#222",
                  marginBottom: "4px"
                }}>{freelancer?.nickname}</div>
                <div style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  marginTop: "10px"
                }}>{freelancer?.freelancerTitle}</div>
              </div>
            </div>
            {/* 정보 1~3열 배치 */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              marginBottom: "10px",
            }}>
              {/* 1열: 유형, 지역, 상주여부(표시) - 좌우폭 맞춤, 내용 강조 */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0px",
                width: "100%",
                marginBottom: "10px",
              }}>
                {/* 유형 */}
                <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                  <span style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#222",
                  }}>{freelancer?.type}</span>
                  <span style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#aaa",
                    fontWeight: 500,
                    marginTop: "2px"
                  }}>유형</span>
                </div>
                {/* 지역 */}
                <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                  <span style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#222",
                  }}>{freelancer?.location}</span>
                  <span style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#aaa",
                    fontWeight: 500,
                    marginTop: "2px"
                  }}>지역</span>
                </div>
                {/* 상주여부 (문구만) */}
                <div style={{ flex: 1, minWidth: 0, textAlign: "center", background: "#f8faff",
                borderRadius: "11px",
                padding: "14px 0",
                fontSize: "22px",
                fontWeight: 800,
                color: "#16a34a",
                letterSpacing: "-1px",
                position: "relative", }}>
                  <span style={{
                    display: "block",
                    fontSize: "15px",
                    fontWeight: 800,
                    color: freelancer?.isOnSite ? "#16a34a" : "#e11d48",
                  }}>
                    {freelancer?.isOnSite ? "상주 가능" : "상주 불가능"}
                  </span>
                </div>
              </div>
              {/* 2열: 평점, 리뷰/관심 (기존 유지), 좌우폭 100%로 맞춤 */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0px",
                width: "100%",
                fontSize: "15px",
                marginBottom: "10px",
              }}>
                <div style={{ flex: 1, minWidth: 0, textAlign: "center", alignItems: "center", display: "flex", justifyContent: "center", gap: "6px" }}>
                  <div style={{ color: "#444", fontWeight: 700, fontSize: "13px", marginBottom: "2px" }}>평점</div>
                  <div style={{ color: "#f59e0b", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                    ★ {(freelancer?.ratingAvg ?? 0).toFixed(1)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#444", fontWeight: 700, fontSize: "13px", marginBottom: "2px" }}>후기 / 관심</div>
                  <div style={{ color: "#666", fontWeight: 600 }}>
                    {freelancer?.reviewsCount ?? 0} / {freelancer?.favoritesCount ?? 0}
                  </div>
                </div>
              </div>
              {/* 3열: 월단가(크게!), 표시는 연하게 */}
              <div style={{
                background: "#f8faff",
                borderRadius: "11px",
                padding: "14px 0",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-1px",
                position: "relative",
              }}>
                <span style={{
                  position: "absolute",
                  left: 18,
                  top: 10,
                  fontSize: "13px",
                  color: "#aaa",
                  fontWeight: 500,
                  opacity: 0.7,
                  letterSpacing: "-0.5px"
                }}>
                  월단가
                </span>
                {Math.round((freelancer?.minMonthlyRate ?? 0) / 10000).toLocaleString()} ~ {Math.round((freelancer?.maxMonthlyRate ?? 0) / 10000).toLocaleString()} 만원
              </div>
            </div>
            {/* 편집 버튼 */}
            <div style={{ textAlign: "center"}}>
              <button
                type="button"
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px", // 기존보다 작게
                  border: "none",
                  borderRadius: "7px", // 라운드도 약간 줄임
                  padding: "8px 22px", // 기존보다 작게
                  boxShadow: "0 2px 8px #16a34a22",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => setModalOpen(true)}
              >
                프로필 편집
              </button>
            </div>
            {/* 모달 */}
            {modalOpen && (
              <div
                style={{
                  position: "fixed",
                  left: 0,
                  top: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(20,20,20,0.16)",
                  zIndex: 2000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  id="edit-modal"
                  style={{
                    background: "#fff",
                    minWidth: 300,
                    boxShadow: "0 8px 32px #16a34a22",
                    borderRadius: "18px",
                    padding: "32px 28px 26px 28px",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <button
                    style={{
                      position: "absolute",
                      right: 18,
                      top: 16,
                      background: "none",
                      border: "none",
                      fontSize: "22px",
                      color: "#888",
                      cursor: "pointer",
                    }}
                    onClick={() => setModalOpen(false)}
                    aria-label="닫기"
                  >
                    ×
                  </button>
                  <h4
                    style={{
                      fontWeight: 700,
                      fontSize: "19px",
                      marginBottom: "24px",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    프로필 관리
                  </h4>
                  <button
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 0px",
                      fontWeight: 700,
                      fontSize: "16px",
                      width: "100%",
                      marginBottom: "16px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      router.push(`/freelancers/${freelancer?.id}/update`);
                    }}
                  >
                    수정하기
                  </button>
                  <button
                    style={{
                      background: "#f3f4f6",
                      color: "#e11d48",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 0px",
                      fontWeight: 700,
                      fontSize: "16px",
                      width: "100%",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (window.confirm("내 모든 프리랜서 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?")) {
                        deleteMyFreelancer();
                        router.push("/freelancers");
                      }
                    }}
                  >
                    프리랜서 탈퇴하기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 상세/탭 카드 */}
          <div
            style={{
              background: "#fff",
              borderRadius: "13px",
              boxShadow: "0 2px 12px #0001",
              padding: "36px 32px",
              flex: 1,
              minHeight: "520px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 탭 */}
            <nav
              style={{
                display: "flex",
                width: "100%",
                borderBottom: "1.5px solid #e7e7e7",
                marginBottom: 18,
                gap: 0,
                boxSizing: "border-box",
              }}
            >
              {[
                { key: "basic", label: "기본정보" },
                { key: "portfolio", label: "포트폴리오" },
                { key: "completed", label: "완료 프로젝트" },
                { key: "review", label: "후기" }
              ].map((tab, idx) => (
                <button
                  key={tab.key}
                  style={{
                    flex: 1,
                    border: "none",
                    borderBottom: activeTab === tab.key ? "3px solid #16a34a" : "1.5px solid #e7e7e7",
                    background: activeTab === tab.key ? "#f8faff" : "transparent",
                    color: activeTab === tab.key ? "#16a34a" : "#666",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "pointer",
                    borderTopLeftRadius: idx === 0 ? "11px" : "0",
                    borderTopRightRadius: idx === 3 ? "11px" : "0",
                    padding: "15px 0",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            {/* Tab content */}
            <div style={{ flex: 1 }}>
              {activeTab === "basic" && (
                <div>
                  <h3 style={{
                    fontWeight: 800,
                    fontSize: "1.12rem",
                    color: "#222",
                    marginBottom: "10px"
                  }}>
                    소개
                  </h3>
                  <p style={{
                    background: "#f8faff",
                    color: "#555",
                    borderRadius: 8,
                    padding: "10px 15px",
                    marginBottom: "40px",
                    fontSize: "16px",
                    lineHeight: "1.75",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}>
                    {freelancer?.content}
                  </p>
                  {/* 경력 */}
                  <div>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <h3 style={{
                    fontWeight: 800,
                    fontSize: "1.12rem",
                    color: "#222",
                    marginBottom: "10px",
                    flex: 1
                  }}>
                    경력
                  </h3>
                  <button
                      type="button"
                      style={{
                        marginLeft: "10px",
                        background: "#f8faff",
                        border: "1px solid #e0e0e0",
                        color: "#16a34a",
                        fontWeight: 600,
                        fontSize: "14px",
                        borderRadius: "7px",
                        padding: "3px 12px",
                        cursor: "pointer",
                        opacity: 0.6
                      }}
                      onClick={() => setCareerAddModalOpen(true)}
                    >
                      + 추가
                    </button>
                    </div>
                    {Array.isArray(freelancer?.careerList) && freelancer?.careerList.length > 0 ? (
                        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                            {freelancer.careerList
                              .slice()
                              .sort((a: any, b: any) => {
                                const da = new Date(a?.startDate);
                                const db = new Date(b?.startDate);
                                const ta = isNaN(da.getTime()) ? Infinity : da.getTime();
                                const tb = isNaN(db.getTime()) ? Infinity : db.getTime();
                                return ta - tb; // earlier start first
                              })
                              .map((c: any, idx: number) => (
              <li
                key={c.id ?? `${c.title}-${c.company}-${c.startDate}-${idx}`}
                style={{
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: "10px",
                fontSize: "15px",
                position: "relative",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                }}
              >
                {/* Left: stacked dates (start on top, end below) */}
                <div style={{ width: 120, minWidth: 100, textAlign: "left", color: "#666" }}>
                  <div style={{ fontSize: "16px", color: "#888", textAlign: "center" }}>{formatFullDate(c.startDate)}</div>
                  <div style={{ fontSize: "12px", color: "#ccc", margin: "4px 0", textAlign: "center" }}>|</div>
                  <div style={{ marginTop: "1px", fontSize: "16px", color: "#888", textAlign: "center" }}>
                    {c.endDate ? formatFullDate(c.endDate) : (c.current ? "재직중" : "-")}
                  </div>
                </div>

                {/* Right: company/title on top, description below */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#222", display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "18px", marginRight: "12px" }}>{c.company}</span>
                    <span style={{ fontSize: "16px", color: "#555", fontWeight: 600 }}>{c.title}</span>
                  </div>
                  {c.description && (
                    <div style={{ marginTop: "8px", color: "#444", lineHeight: 1.5 }}>{c.description}</div>
                  )}
                </div>

                {/* Edit button aligned to the right */}
                <div style={{ marginLeft: "8px", display: "flex", alignItems: "start" }}>
                  <button
                    type="button"
                    style={{
                      background: "#f8faff",
                      border: "1px solid #e0e0e0",
                      color: "#464847ff",
                      fontWeight: 600,
                      fontSize: "13px",
                      borderRadius: "3px",
                      padding: "2px 5px",
                      cursor: "pointer",
                      opacity: 0.85
                    }}
                    onClick={() => {
                      setEditCareerModalOpen(true);
                      setSelectedCareerId(c.id);
                    }}
                  >
                    수정
                  </button>
                </div>
              </li>
                            ))}
                        </ul>
                        ) : (
                        <div style={{ color: "#888" }}>경력 정보가 없습니다.</div>
                        )}

                  {careerAddModalOpen && (
                    <CareerAddModal
                        onClose={() => setCareerAddModalOpen(false)}
                        onAdd={async (career) => {
                        // 실제 등록 로직(API 호출 후 목록 갱신)
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/careers`,
                          {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(career),
                          }
                        );
                        if (!res.ok) {
                          alert("경력 등록 실패");
                          return;
                        }
                        const data = await res.json();
                        const newCareer = data.data;
                        setCareerAddModalOpen(false);
                        alert("경력이 성공적으로 등록되었습니다.");
                        setFreelancer((prev: any) => ({
                          ...prev,
                          careerList: [...(prev.careerList || []), newCareer],
                        }));
                        }}
                    />
                    )}
          {editCareerModalOpen && selectedCareerId != null && (
          <CareerEditModal
            id={selectedCareerId}
            onClose={() => setEditCareerModalOpen(false)}
            onEdit={async (updatedCareer) => {
            setEditCareerModalOpen(false);
            // 서버에서 최신 freelancer 정보 fetch (수정 직후)
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me`, {
              method: "GET", credentials: "include"
              });
              if (res.ok) {
              const latest = await res.json();
              setFreelancer(latest);
              }
            } catch (err) {
              // fetch 실패시 기존 방식으로 로컬 업데이트
              setFreelancer((prev: any) => ({
              ...prev,
              careerList: prev.careerList.map((c: any) =>
                String(c.id) === String(updatedCareer.id) ? updatedCareer : c
              ),
              }));
            }
            }}
          />
          )}
                  </div>
                  {/* 스킬 */}
                  <div>
                  <div style={{ marginBottom: "2px", marginTop: "28px", display: "flex", alignItems: "center" }}>
                    <h3 style={{
                    fontWeight: 800,
                    fontSize: "1.12rem",
                    color: "#222",
                    marginTop: "20px",
                    marginBottom: "15px",
                    flex: 1
                  }}
                  >
                    기술스택
                  </h3>
                  <button
                      type="button"
                      style={{
                        marginLeft: "10px",
                        background: "#f8faff",
                        border: "1px solid #e0e0e0",
                        color: "#16a34a",
                        fontWeight: 600,
                        fontSize: "14px",
                        borderRadius: "7px",
                        padding: "3px 12px",
                        cursor: "pointer",
                        opacity: 0.6
                      }}
                      onClick={() => setTechAddModalOpen(true)}
                    >
                      + 추가
                    </button>
                    </div>
                    <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
                      {((freelancer?.techList || []) as any[]).length > 0 ? (
                        (() => {
                          // group by techLevel -> display order: HIGH, MID, LOW, 기타
                          const groups: Record<string, any[]> = { HIGH: [], MID: [], LOW: [], OTHER: [] };
                          // Expect backend to use: BEGINNER, INTERMEDIATE, ADVANCED
                          (freelancer!.techList || []).forEach((t: any) => {
                            const lvl = (t.techLevel || t.level || "").toString().toUpperCase();
                            if (lvl === "ADVANCED" || lvl === "ADV") groups.HIGH.push(t);
                            else if (lvl === "INTERMEDIATE" || lvl === "MID") groups.MID.push(t);
                            else if (lvl === "BEGINNER" || lvl === "LOW") groups.LOW.push(t);
                            else groups.OTHER.push(t);
                          });

                          const renderGroup = (label: string, items: any[]) => {
                            if (!items || items.length === 0) return null;
                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }} key={label}>
                                <div style={{ fontSize: 12, color: "#666", fontWeight: 700 }}>{label}</div>
                                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                                  {items.map((tech: any) => (
                                    <span
                                      key={tech.id ?? tech.techName}
                                      style={{
                                        background: "#f7f7f7",
                                        color: "#72a685ff",
                                        fontWeight: 600,
                                        borderRadius: "8px",
                                        padding: "5px 13px",
                                        fontSize: "13px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                      }}
                                    >
                                      <span>{tech.techName ?? tech}</span>
                                      <button
                                        type="button"
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#e11d48",
                                          fontWeight: 700,
                                          fontSize: "15px",
                                          cursor: "pointer",
                                          padding: "0 2px",
                                          lineHeight: 1,
                                          opacity: 0.65,
                                        }}
                                        title="삭제"
                                        onClick={async () => {
                                          if (!window.confirm(`${tech.techName ?? tech} 기술스택을 삭제할까요?`)) return;
                                          try {
                                            const res = await fetch(
                                              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/techs/${tech.id}`,
                                              { method: "DELETE", credentials: "include" }
                                            );
                                            if (!res.ok) throw new Error("삭제 실패");
                                            setFreelancer((prev: any) => ({
                                              ...prev,
                                              techList: prev.techList.filter((t: any) => t.id !== tech.id),
                                            }));
                                          } catch (err) {
                                            alert("삭제에 실패했습니다.");
                                          }
                                        }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          };

                          return (
                            <>
                              {renderGroup("고급", groups.HIGH)}
                              {renderGroup("중급", groups.MID)}
                              {renderGroup("초급", groups.LOW)}
                              {renderGroup("기타", groups.OTHER)}
                            </>
                          );
                        })()
                      ) : (
                        <div style={{ color: "#888" }}>등록된 스킬이 없습니다.</div>
                      )}
                    </div>
                    {techAddModalOpen && (
                    <TechAddModal
                        onClose={() => setTechAddModalOpen(false)}
                        onAdd={(tech) => {
                        setFreelancer((prev: any) => ({
                            ...prev,
                            techList: [...(prev.techList || []), tech],
                        }));
                        }}
                    />
                    )}
                  </div>
                </div>
              )}
              {activeTab === "portfolio" && (
                <div style={{ minHeight: 220 }}>
                  {portfolios.length > 0 ? (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "32px",
                      marginBottom: "38px"
                    }}>
                      {portfolios.map((p: any) => (
                        <div
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openPortfolioModal(p.id)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openPortfolioModal(p.id); }}
                          style={{
                            background: "#f8faff",
                            padding: "24px",
                            borderRadius: "13px",
                            border: "1px solid #ececec",
                            boxShadow: "0 2px 8px #16a34a22",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            minHeight: "320px",
                            cursor: "pointer",
                          }}
                        >
                          {/* 이미지 (비중 크게) */}
                          <div style={{
                            width: "100%",
                            maxWidth: "320px",
                            height: "210px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            background: "#ededed",
                            marginBottom: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 10px #0001",
                          }}>
                            {p.imageUrl ? (
                              <img
                                src={fullImageUrl(p.imageUrl)}
                                alt={p.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "10px",
                                }}
                              />
                            ) : (
                              <span style={{ color: "#aaa", fontSize: "13px" }}>이미지 없음</span>
                            )}
                          </div>
                          {/* 제목 */}
                          <div style={{
                            fontWeight: 700,
                            fontSize: "1.09rem",
                            color: "#222",
                            marginBottom: "12px",
                            textAlign: "center",
                            maxWidth: "92%",
                            overflowWrap: "break-word"
                          }}>{p.title}</div>
                          {/* 기간 + 기여도(비중 낮춤) */}
                          <div style={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "15px",
                            marginTop: "8px",
                          }}>
                            <span style={{ color: "#555" }}>
                              {formatDate(p.startDate)} ~ {formatDate(p.endDate)}
                            </span>
                            <span style={{
                              background: "#e7e7e7",
                              color: "#16a34a",
                              fontWeight: 500,
                              borderRadius: "8px",
                              padding: "5px 10px",
                              fontSize: "14px"
                            }}>
                              {p.contribution}% 기여
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      minHeight: 220,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888"
                    }}>
                      포트폴리오 정보가 없습니다.
                    </div>
                  )}
                  {/* 포트폴리오 추가 버튼 */}
                  <div style={{ textAlign: "center", marginTop: "18px" }}>
                    <PortfolioAddButton />
                  </div>
                </div>
              )}
              {activeTab === "completed" && (
                <div style={{ minHeight: 220 }}>
                  {completedProjects.length > 0 ? (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "18px"
                    }}>
                      {completedProjects.map((cp: any) => (
                        <div
                          key={cp.id}
                          style={{
                            background: "#f8faff",
                            padding: "14px",
                            borderRadius: "9px",
                            border: "1px solid #ececec",
                            boxShadow: "0 2px 8px #16a34a22",
                          }}
                        >
                          <div style={{
                            fontWeight: 700,
                            color: "#16a34a",
                            marginBottom: "8px",
                            fontSize: "15px"
                          }}>{cp.title}</div>
                          <div style={{ color: "#222", fontSize: "15px", marginBottom: "7px" }}>
                            {cp.description}
                          </div>
                          <div style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>{cp.period}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      minHeight: 220,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888"
                    }}>
                      완료된 프로젝트 정보가 없습니다.
                    </div>
                  )}
                </div>
              )}
              {activeTab === "review" && (
  <div
    style={{
      minHeight: 220,
      padding: "20px 10px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    {reviews.length === 0 ? (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontSize: "16px",
        }}
      >
        아직 등록된 후기가 없습니다.
      </div>
    ) : (
      reviews.map((review: any) => (
        <div
          key={review.id}
          style={{
            background: "#f8faff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            padding: "20px 22px",
            border: "1px solid #eee",
          }}
        >
          {/* 상단: 평점 + 제목 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#f59e0b",
                fontWeight: 700,
                fontSize: "16px",
              }}
            >
              {"★".repeat(review.rating)}{" "}
              <span style={{ color: "#555", marginLeft: "8px" }}>
                ({review.rating}점)
              </span>
            </div>
            <div
              style={{
                color: "#666",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              {new Date(review.createdAt).toLocaleDateString("ko-KR")}
            </div>
          </div>

          {/* 제목 */}
          <div
            style={{
              fontWeight: 800,
              fontSize: "17px",
              color: "#222",
              marginBottom: "10px",
            }}
          >
            {review.title}
          </div>

          {/* 내용 */}
          <div
            style={{
              color: "#444",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              marginBottom: "14px",
            }}
          >
            {review.content}
          </div>

          {/* 작성자 정보 */}
          <div
            style={{
              textAlign: "right",
              fontSize: "14px",
              color: "#777",
              fontWeight: 600,
            }}
          >
            작성자: {review.authorNickname || `ID ${review.authorId}`}
          </div>
        </div>
      ))
    )}
  </div>
)}
            </div>
          </div>
          {/* 포트폴리오 상세 모달 */}
          {portfolioModalOpen && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 60,
                padding: "20px",
              }}
              onClick={closePortfolioModal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: 820,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                  position: "relative",
                }}
              >
                {/* 액션 버튼들 (우측 상단, 눈에 잘 띄지 않게) */}
                {modalPortfolio && (
                  <div style={{
                    position: "absolute",
                    top: 18,
                    right: 24,
                    display: "flex",
                    gap: "8px"
                  }}>
                    <button
                      title="수정"
                      onClick={() => {
                        router.push(`/freelancers/portfolios/${modalPortfolio.id}/update`);
                        closePortfolioModal();
                      }}
                      style={{
                        padding: "6px 13px",
                        borderRadius: "7px",
                        border: "1px solid #e0e0e0",
                        background: "#f8faff",
                        color: "#16a34a",
                        fontWeight: 600,
                        fontSize: "14px",
                        opacity: 0.7,
                        cursor: "pointer"
                      }}
                    >
                      수정
                    </button>
                    <button
                      title="삭제"
                      onClick={() => handleDeletePortfolio(modalPortfolio.id)}
                      style={{
                        padding: "6px 13px",
                        borderRadius: "7px",
                        border: "1px solid #e0e0e0",
                        background: "#f8faff",
                        color: "#e11d48",
                        fontWeight: 600,
                        fontSize: "14px",
                        opacity: 0.7,
                        cursor: "pointer"
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
                {modalLoading ? (
                  <div style={{ padding: 40, textAlign: "center" }}>로딩 중...</div>
                ) : !modalPortfolio ? (
                  <div style={{ padding: 40, textAlign: "center" }}>포트폴리오 정보를 불러올 수 없습니다.</div>
                ) : (
                  <div style={{ padding: 28 }}>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: 900, textAlign: "center", marginBottom: 18 }}>{modalPortfolio.title}</h2>
                    <div style={{ width: "100%", maxWidth: 700, height: 360, margin: "0 auto 20px", borderRadius: 12, overflow: "hidden", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {modalPortfolio.imageUrl ? (
                        <img src={fullImageUrl(modalPortfolio.imageUrl)} alt={modalPortfolio.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ color: "#94a3b8", fontWeight: 600 }}>이미지 없음</div>
                      )}
                    </div>
                    <div style={{ color: "#444", fontSize: 15, lineHeight: 1.7, marginBottom: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{modalPortfolio.description}</div>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 12 }}>
                      <div style={{ color: "#555", fontWeight: 700 }}>기간: {formatDate(modalPortfolio.startDate)} ~ {formatDate(modalPortfolio.endDate)}</div>
                      <div style={{ background: "#e7e7e7", color: "#16a34a", fontWeight: 700, borderRadius: 8, padding: "6px 10px" }}>{modalPortfolio.contribution}% 기여</div>
                    </div>
                    {modalPortfolio.externalUrl && (
                      <div style={{ textAlign: "center", marginTop: 6 }}>
                        <a href={modalPortfolio.externalUrl} target="_blank" rel="noreferrer" style={{ color: "#16a34a", fontWeight: 700 }}>포트폴리오 자세히 보기 &gt;</a>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
                      <button onClick={closePortfolioModal} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontWeight: 700 }}>닫기</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}