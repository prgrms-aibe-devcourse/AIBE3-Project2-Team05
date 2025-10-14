"use client";
import { use, useEffect, useState } from "react";

function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
}

export default function FreelancerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use(params); // 수정 X
  const [freelancer, setFreelancer] = useState<any | null>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "basic" | "portfolio" | "completed"
  >("basic");

  useEffect(() => {
    if (!id) return;
    const fetchAllData = async () => {
      try {
        const freelancerPromise = fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/${id}`,
          { method: "GET", credentials: "include" }
        ).then((res) => res.json());
        const portfolioPromise = fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/${id}/portfolios`,
          { method: "GET", credentials: "include" }
        ).then((res) => res.json());
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
  }, [id]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#f8f4eb] to-[#fafdff] flex justify-center"
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
            className="text-[28px] font-extrabold text-[#1E1B16] tracking-tighter"
            style={{ marginBottom: "0.4rem", letterSpacing: "-1px" }}
          >
            프리랜서 페이지
          </h1>
          <p className="text-[#6A6558] text-[15px] font-[400]">
            내 프로젝트에 딱 맞는 전문가를 만나보세요.
          </p>
        </div>

        {/* 카드 레이아웃 */}
        <div
          className="flex items-stretch"
          style={{ gap: "2rem", marginTop: "2rem" }}
        >
          {/* 왼쪽 카드 (프로필) */}
          <div
            className="flex-2 bg-[#fff] border border-[#E8E3D9] rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex flex-col justify-start"
            style={{
              padding: "2.2rem 2rem",
              minHeight: "520px",
              maxWidth: 370,
            }}
          >
            <div
              className="flex flex-col items-center"
              style={{ width: "100%" }}
            >
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "20%",
                  overflow: "hidden",
                  background: "#f3f1ee",
                  marginBottom: "1.2rem",
                  boxShadow: "0 2px 8px #e8e3d9",
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

              <h2 className="text-[22px] font-bold text-[#1E1B16] mb-1">
                {freelancer?.nickname}
              </h2>
              <div
                className="text-[#3d7afe] text-[15px] font-semibold"
                style={{
                  marginTop: "2px",
                  marginBottom: "14px",
                  background: "#e6f0ff",
                  padding: "2px 14px",
                  borderRadius: "8px",
                  letterSpacing: "-0.2px",
                }}
              >
                {freelancer?.freelancerTitle}
              </div>

              <div
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.1rem",
                  marginTop: "0.5rem",
                }}
              >
                {/* 유동 정보 */}
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium mb-1">
                    유형
                  </div>
                  <div className="text-[14px] text-[#6A6558]">
                    {freelancer?.type}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium mb-1">
                    지역
                  </div>
                  <div className="text-[14px] text-[#6A6558]">
                    {freelancer?.location}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium mb-1">
                    상주 여부
                  </div>
                  <div className="text-[14px] text-[#6A6558]">
                    {freelancer?.isOnSite ? (
                      <span className="bg-[#e6f0ff] text-[#2563eb] px-2 py-1 rounded-md font-semibold">
                        상주 가능
                      </span>
                    ) : (
                      <span className="bg-[#f3f4f6] text-[#888] px-2 py-1 rounded-md font-semibold">
                        상주 불가능
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium mb-1">
                    월 단가
                  </div>
                  <div className="text-[18px] font-bold text-[#1E1B16]">
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
                  <div className="text-[13px] text-[#1E1B16] font-medium mb-1">
                    평점
                  </div>
                  <div className="text-[14px] text-[#6A6558] flex items-center gap-1">
                    <span
                      style={{
                        color: "#f59e0b",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      ★
                    </span>
                    {(freelancer?.ratingAvg ?? 0).toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#1E1B16] font-medium mb-1">
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

          {/* 오른쪽 카드 (탭) */}
          <div
            className="flex-9 bg-[#fff] border border-[#E8E3D9] rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.07)] flex flex-col justify-start"
            style={{ padding: "2.2rem 2rem", minHeight: "520px" }}
          >
            {/* Tabs nav - 카드 가로 전체 채우기 */}
            <nav
              style={{
                display: "flex",
                width: "100%",
                borderBottom: "1.5px solid #E8E3D9",
                marginBottom: 18,
                paddingBottom: 0,
                gap: 0,
              }}
            >
              {[
                { key: "basic", label: "기본정보" },
                { key: "portfolio", label: "포트폴리오" },
                { key: "completed", label: "완료 프로젝트" },
              ].map((tab, idx) => (
                <button
                  key={tab.key}
                  className={`transition-all font-semibold text-[16px] py-4
                    ${
                      activeTab === tab.key
                        ? "text-[#1E1B16] border-b-3 border-[#3d7afe] bg-[#f8faff]"
                        : "text-[#6A6558] bg-transparent hover:bg-[#f8faff]"
                    }
                  `}
                  style={{
                    flex: 1,
                    border: "none",
                    borderBottom:
                      activeTab === tab.key
                        ? "3px solid #3d7afe"
                        : "1.5px solid #E8E3D9",
                    background:
                      activeTab === tab.key ? "#f8faff" : "transparent",
                    color: activeTab === tab.key ? "#1E1B16" : "#6A6558",
                    outline: "none",
                    cursor: "pointer",
                    borderTopLeftRadius: idx === 0 ? "12px" : "0",
                    borderTopRightRadius: idx === 2 ? "12px" : "0",
                  }}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Tab content */}
            <div>
              {activeTab === "basic" && (
                <div>
                  <h3 className="text-[17px] font-bold text-[#1E1B16] mb-3">
                    프리랜서 소개
                  </h3>
                  <p
                    className="text-[#6A6558] mb-5"
                    style={{ lineHeight: "1.8", fontSize: "16px" }}
                  >
                    {freelancer?.content}
                  </p>

                  <div className="mb-5">
                    <h4 className="text-[14px] font-semibold text-[#1E1B16] mb-2">
                      경력
                    </h4>
                    {Array.isArray(freelancer?.careerList) &&
                    freelancer?.careerList.length > 0 ? (
                      <ul className="space-y-4">
                        {freelancer.careerList.map((c: any) => (
                          <li
                            key={c.id}
                            style={{
                              background: "#f8faff",
                              borderRadius: 8,
                              padding: "10px 15px",
                            }}
                          >
                            <div className="font-semibold text-[#2563eb]">
                              {c.title} · {c.company}
                            </div>
                            <div className="text-[#6b7280] text-sm mt-1">
                              {c.startDate} - {c.endDate}{" "}
                              {c.current ? "(재직중)" : ""}
                            </div>
                            {c.description ? (
                              <div className="mt-1 text-[#374151]">
                                {c.description}
                              </div>
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
                            className="bg-[#e6f0ff] px-4 py-[7px] rounded-full text-[#2563eb] font-semibold text-[13px] border border-[#dbeafe]"
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
                <div style={{ minHeight: 220 }}>
                  {portfolios.length > 0 ? (
                    <div className="grid grid-cols-2 gap-7">
                      {portfolios.map((p: any) => (
                        <div
                          key={p.id}
                          className="bg-[#f8faff] p-4 rounded-xl border border-[#e8e3d9] shadow"
                        >
                          <div className="font-bold text-[#2563eb] mb-2">
                            {p.title}
                          </div>
                          <div className="mb-2 text-[#1E1B16]">
                            {p.description}
                          </div>
                          {p.imageUrl && (
                            <img
                              src={fullImageUrl(p.imageUrl)}
                              alt={p.title}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "130px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          )}
                          <div className="mt-2 text-xs text-[#6b7280]">
                            {p.link}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{ minHeight: 220 }}
                      className="flex items-center justify-center text-[#6A6558]"
                    >
                      포트폴리오 정보가 없습니다.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "completed" && (
                <div style={{ minHeight: 220 }}>
                  {completedProjects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-7">
                      {completedProjects.map((cp: any) => (
                        <div
                          key={cp.id}
                          className="bg-[#f8faff] p-4 rounded-xl border border-[#e8e3d9] shadow"
                        >
                          <div className="font-bold text-[#2563eb] mb-2">
                            {cp.title}
                          </div>
                          <div className="mb-2 text-[#1E1B16]">
                            {cp.description}
                          </div>
                          <div className="mt-2 text-xs text-[#6b7280]">
                            {cp.period}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{ minHeight: 220 }}
                      className="flex items-center justify-center text-[#6A6558]"
                    >
                      완료된 프로젝트 정보가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
