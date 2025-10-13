"use client";

import { use } from "react";

import { apiFetch } from "@/lib/backend/client";
import { useEffect, useState } from "react";

const IMAGE_HOST = "http://localhost:8080";
function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${IMAGE_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function FreelancerDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const [freelancer, setFreelancer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch(`/api/v1/freelancers/${id}`)
      .then((res) => {
        if (cancelled) return;
        setFreelancer(res);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch freelancer", err);
        setError(String(err || "Unknown error"));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div className="text-red-600">에러: {error}</div>;
  if (!freelancer) return <div>데이터가 없습니다.</div>;

  const resident = !!(
    freelancer.isOnSite ||
    freelancer.isResident ||
    freelancer.isOnsite
  );
  const minMan = Math.round(
    (freelancer.minMonthlyRate ?? freelancer.minRate ?? 0) / 10000
  );
  const maxMan = Math.round(
    (freelancer.maxMonthlyRate ?? freelancer.maxRate ?? 0) / 10000
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div style={{ display: "flex", gap: 24 }}>
          {/* Left column: summary */}
          <aside style={{ width: 320, flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <img
                src={fullImageUrl(freelancer.freelancerProfileImageUrl)}
                alt={freelancer.nickname}
                style={{
                  width: 140,
                  height: 140,
                  objectFit: "cover",
                  borderRadius: "9999px",
                }}
              />
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>
                {freelancer.nickname}
              </h2>
              <div style={{ color: "#6b7280" }}>
                {freelancer.freelancerTitle}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "#f3f4f6",
                  }}
                >
                  {freelancer.type}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: resident ? "#e6f0ff" : "#f3f4f6",
                    color: resident ? "#1e3a8a" : "#6b7280",
                  }}
                >
                  {resident ? "상주 가능" : "상주 불가능"}
                </span>
              </div>

              <div style={{ marginTop: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>
                  {minMan.toLocaleString()}만 ~ {maxMan.toLocaleString()}만
                </div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>월 단가</div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div>
                  ⭐{" "}
                  <strong style={{ color: "#f59e0b" }}>
                    {(freelancer.ratingAvg ?? 0).toFixed(1)}
                  </strong>
                </div>
                <div style={{ color: "#6b7280" }}>
                  {freelancer.reviewsCount ?? freelancer.reviewCount ?? 0} 리뷰
                </div>
                <div style={{ color: "#6b7280" }}>
                  {freelancer.favoritesCount ?? 0} 관심
                </div>
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <button
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                  }}
                >
                  연락하기
                </button>
              </div>
            </div>
          </aside>

          {/* Right column: details */}
          <section style={{ flex: 1 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>프리랜서 소개</h3>
              <p style={{ marginTop: 8, color: "#374151", lineHeight: 1.6 }}>
                {freelancer.content}
              </p>
            </div>

            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>경력</h3>
              {Array.isArray(freelancer.careerList) &&
              freelancer.careerList.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
                  {freelancer.careerList.map((c: any) => (
                    <li
                      key={c.id ?? Math.random()}
                      style={{ marginBottom: 10 }}
                    >
                      <div style={{ fontWeight: 700 }}>
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
                <div style={{ color: "#6b7280", marginTop: 8 }}>
                  경력 정보가 없습니다.
                </div>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>보유 스킬</h3>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {(freelancer.techList || []).length > 0 ? (
                  freelancer.techList.map((t: string) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 13,
                        background: "#f1f1f1",
                        padding: "6px 10px",
                        borderRadius: 9999,
                      }}
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <div style={{ color: "#6b7280" }}>보유 기술이 없습니다.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
