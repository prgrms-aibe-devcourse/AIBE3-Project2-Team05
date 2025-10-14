"use client";
import { useEffect, useState } from "react";

function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // treat as relative path from backend
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
}

export default function FreelancerMyPage() {
  const [freelancer, setFreelancer] = useState<any | null>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "basic" | "portfolio" | "completed"
  >("basic");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // ⭐️ 1. 두 개의 Promise를 배열에 담아 준비합니다.
        const freelancerPromise = fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me`,
          { method: "GET", credentials: "include" }
        ).then((res) => res.json()); // 응답 파싱까지 포함

        // const portfolioPromise = fetch(
        //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/portfolios`,
        //   { method: "GET", credentials: "include" }
        // ).then((res) => res.json()); // 응답 파싱까지 포함

        // ⭐️ 2. Promise.all을 사용하여 두 요청이 완료될 때까지 기다립니다. (병렬 실행)
        const [freelancerData] = await Promise.all([freelancerPromise]);

        // ⭐️ 3. 두 데이터를 한 번에 상태에 업데이트합니다.
        setFreelancer(freelancerData);
      } catch (err) {
        console.error("API 호출 중 오류 발생:", err);
        // 에러 발생 시 사용자에게 적절한 피드백 제공
      }
    };

    fetchAllData();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#f8f4eb] flex justify-center"
      style={{
        paddingTop: "68px",
        paddingBottom: "180px",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
    >
      <div className="w-full max-w-[1100px]">
        {/* 제목 */}
        <div>
          <h1
            className="text-[26px] font-extrabold text-[#1E1B16]"
            style={{ marginBottom: "0.25rem" }}
          >
            내 프리랜서 관리하기
          </h1>
          <p className="text-[#6A6558] text-[15px] font-[400]">.</p>
        </div>

        {/* 카드 레이아웃 */}
        <div className="flex items-stretch" style={{ gap: "1.5rem" }}>
          {/* 왼쪽 카드 */}
          <div
            className="flex-2 bg-[#FFFFFF] border border-[#E8E3D9] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-start"
            style={{ padding: "2rem", minHeight: "520px" }}
          >
            <div
              className="flex flex-col items-center"
              style={{ width: "100%" }}
            >
              <div
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: 9999,
                  overflow: "hidden",
                  background: "#f3f1ee",
                  marginBottom: "1rem",
                }}
              >
                <img
                  src={fullImageUrl(freelancer?.freelancerProfileImageUrl)}
                  alt={freelancer?.nickname || "프리랜서"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <h2 className="text-[20px] font-bold text-[#1E1B16]">
                {freelancer?.nickname}
              </h2>
              <div
                className="text-[#6A6558] text-[15px]"
                style={{ marginTop: "3px", marginBottom: "8px" }}
              >
                {freelancer?.freelancerTitle}
              </div>

              <div
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium">
                    유형
                  </div>
                  <div className="text-[14px] text-[#6A6558]">
                    {freelancer?.type}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium">
                    지역
                  </div>
                  <div className="text-[14px] text-[#6A6558]">
                    {freelancer?.location}
                  </div>
                </div>

                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium">
                    상주 여부
                  </div>
                  <div className="text-[14px] text-[#6A6558]">
                    {freelancer?.isOnSite ? "상주 가능" : "상주 불가능"}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium">
                    월 단가
                  </div>
                  <div className="text-[18px] font-bold">
                    {Math.round(
                      (freelancer?.minMonthlyRate ?? 0) / 1
                    ).toLocaleString()}{" "}
                    ~{" "}
                    {Math.round(
                      (freelancer?.maxMonthlyRate ?? 0) / 1
                    ).toLocaleString()}{" "}
                    원
                  </div>
                </div>

                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium">
                    평점
                  </div>
                  <div className="text-[14px] text-[#6A6558]">
                    {(freelancer?.ratingAvg ?? 0).toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium">
                    리뷰 / 관심
                  </div>
                  <div className="text-[14px] text-[#6A6558]">
                    {freelancer?.reviewsCount ?? 0} /{" "}
                    {freelancer?.favoritesCount ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 카드 */}
          <div
            className="flex-9 bg-[#FFFFFF] border border-[#E8E3D9] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-start"
            style={{ padding: "2rem", minHeight: "520px" }}
          >
            {/* Tabs nav */}
            <div
              style={{ borderBottom: "1px solid #E8E3D9", marginBottom: 12 }}
              className="pb-2"
            >
              <ul className="flex gap-4">
                <li>
                  <button
                    className={`px-3 py-2 ${
                      activeTab === "basic"
                        ? "font-semibold border-b-2 border-[#1E1B16]"
                        : "text-[#6A6558]"
                    }`}
                    onClick={() => setActiveTab("basic")}
                  >
                    기본정보
                  </button>
                </li>
                <li>
                  <button
                    className={`px-3 py-2 ${
                      activeTab === "portfolio"
                        ? "font-semibold border-b-2 border-[#1E1B16]"
                        : "text-[#6A6558]"
                    }`}
                    onClick={() => setActiveTab("portfolio")}
                  >
                    포트폴리오
                  </button>
                </li>
                <li>
                  <button
                    className={`px-3 py-2 ${
                      activeTab === "completed"
                        ? "font-semibold border-b-2 border-[#1E1B16]"
                        : "text-[#6A6558]"
                    }`}
                    onClick={() => setActiveTab("completed")}
                  >
                    완료 프로젝트
                  </button>
                </li>
              </ul>
            </div>

            {/* Tab content */}
            <div>
              {activeTab === "basic" && (
                <div>
                  <h3 className="text-[16px] font-bold text-[#1E1B16] mb-3">
                    프리랜서 소개
                  </h3>
                  <p className="text-[#6A6558] mb-4">{freelancer?.content}</p>

                  <div className="mb-4">
                    <h4 className="text-[14px] font-semibold text-[#1E1B16] mb-2">
                      경력
                    </h4>
                    {Array.isArray(freelancer?.careerList) &&
                    freelancer?.careerList.length > 0 ? (
                      <ul className="space-y-3">
                        {freelancer.careerList.map((c: any) => (
                          <li key={c.id}>
                            <div className="font-semibold">
                              {c.title} · {c.company}
                            </div>
                            <div className="text-[#6b7280] text-sm">
                              {c.startDate} - {c.endDate}{" "}
                              {c.current ? "(재직중)" : ""}
                            </div>
                            {c.description ? (
                              <div className="mt-1">{c.description}</div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-[#6A6558]">
                        경력 정보가 없습니다.
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[14px] font-semibold text-[#1E1B16] mb-2">
                      보유 스킬
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {(freelancer?.techList || []).length > 0 ? (
                        freelancer?.techList.map((tech: any) => (
                          <span
                            key={tech.id ?? tech.techName}
                            className="bg-[#f1f1f1] px-3 py-1 rounded-full"
                          >
                            {tech.techName ?? tech}
                          </span>
                        ))
                      ) : (
                        <div className="text-[#6A6558]">
                          등록된 스킬이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "portfolio" && (
                <div
                  style={{ minHeight: 220 }}
                  className="flex items-center justify-center text-[#6A6558]"
                >
                  포트폴리오 정보가 없습니다.
                </div>
              )}

              {activeTab === "completed" && (
                <div
                  style={{ minHeight: 220 }}
                  className="flex items-center justify-center text-[#6A6558]"
                >
                  완료된 프로젝트 정보가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
