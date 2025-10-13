"use client";
import { use, useEffect, useState } from "react";

function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // treat as relative path from backend
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
}

export default function FreelancerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use(params);
  const [freelancer, setFreelancer] = useState<any | null>(null);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/${id}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        setFreelancer(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFreelancer();
  }, [id]);

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
            마이페이지
          </h1>
          <p className="text-[#6A6558] text-[15px] font-[400]">
            프로필 정보와 활동 현황을 관리하세요
          </p>
        </div>

        {/* 카드 레이아웃 */}
        <div className="flex items-stretch" style={{ gap: "1.5rem" }}>
          {/* 왼쪽 카드 */}
          <div
            className="flex-2 bg-[#FFFFFF] border border-[#E8E3D9] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-start"
            style={{ padding: "2rem", minHeight: "520px" }}
          >
            <div>
              <div
                className="flex items-center gap-2"
                style={{ marginBottom: "1rem" }}
              >
                <div
                  style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: 9999,
                    overflow: "hidden",
                    background: "#f3f1ee",
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
                <div>
                  <h2 className="text-[18px] font-bold text-[#1E1B16]">
                    {freelancer?.nickname}
                  </h2>
                  <div className="text-[#6A6558] text-[14px]">
                    {freelancer?.freelancerTitle}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginTop: "1.25rem",
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
            style={{ padding: "3.5rem", minHeight: "520px" }}
          >
            <div>
              <h2
                className="text-[16px] font-bold text-[#1E1B16]"
                style={{ marginBottom: "0.75rem" }}
              >
                프리랜서 소개
              </h2>
              <p
                className="text-[#6A6558] text-[14px]"
                style={{ marginBottom: "1.5rem" }}
              >
                {freelancer?.content}
              </p>

              <div style={{ marginTop: "1.5rem" }}>
                <h3
                  className="text-[14px] font-semibold text-[#1E1B16]"
                  style={{ marginBottom: 8 }}
                >
                  경력
                </h3>
                {Array.isArray(freelancer?.careerList) &&
                freelancer?.careerList.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {freelancer?.careerList.map((c: any) => (
                      <li key={c.id} style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600 }}>
                          {c.title} · {c.company}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: 13 }}>
                          {c.startDate} - {c.endDate}{" "}
                          {c.current ? "(재직중)" : ""}
                        </div>
                        {c.description ? (
                          <div style={{ marginTop: 6 }}>{c.description}</div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-[#6A6558]">경력 정보가 없습니다.</div>
                )}
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <h3
                  className="text-[14px] font-semibold text-[#1E1B16]"
                  style={{ marginBottom: 8 }}
                >
                  보유 스킬
                </h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(freelancer?.techList || []).length > 0 ? (
                    freelancer?.techList.map((t: string) => (
                      <span
                        key={t}
                        style={{
                          background: "#f1f1f1",
                          padding: "6px 10px",
                          borderRadius: 9999,
                        }}
                      >
                        {t}
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
          </div>
        </div>
      </div>
    </div>
  );
}
