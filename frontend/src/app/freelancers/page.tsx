"use client";

import { apiFetch } from "@/lib/backend/client";
import Link from "next/link";
import { useEffect, useState } from "react";

const IMAGE_HOST = "http://localhost:8080";

function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // treat as relative path from backend
  return `${IMAGE_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function FreelancerSearchPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // filter state
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [showOnlyResident, setShowOnlyResident] = useState<boolean>(false);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set()
  );

  function toggleType(type: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function toggleLocation(loc: string) {
    setSelectedLocations((prev) => {
      const next = new Set(prev);
      if (next.has(loc)) next.delete(loc);
      else next.add(loc);
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch("/api/v1/freelancers")
      .then((res) => {
        if (cancelled) return;
        // assume API returns an array of freelancers matching the DTO field names
        setFreelancers(res || []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch freelancers", err);
        setError(String(err || "Unknown error"));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [query, setQuery] = useState("");

  const filtered = freelancers.filter((f) => {
    if (!query) return true;
    const q = query.toLowerCase();
    // user said they changed mock data field names — use those names
    const name = (f.nickname || "").toString();
    const title = (f.freelancerTitle || "").toString();
    const skills = (f.skills || []).join(" ");
    return (
      name.toLowerCase().includes(q) ||
      title.toLowerCase().includes(q) ||
      skills.toLowerCase().includes(q)
    );
  });

  // apply structured filters (type, isOnSite/상주, location)
  const filteredWithFilters = filtered.filter((f) => {
    // type filter
    if (selectedTypes.size > 0) {
      const t = f.type || f.freelancerType || "";
      if (!selectedTypes.has(t)) return false;
    }

    // resident / 상주 filter
    if (showOnlyResident) {
      // API field isOnSite was used earlier but user clarified: this means resident availability
      if (!f.isOnSite && !f.isResident && !f.isOnsite) return false;
      // treat truthy values as available
    }

    // location filter
    if (selectedLocations.size > 0) {
      const loc = (f.location || "").toString();
      if (!selectedLocations.has(loc)) return false;
    }

    return true;
  });

  return (
    <div
      className="bg-gray-100 min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <main
        className="container mx-auto px-4 py-8"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}
      >
        <h2
          className="text-xl font-bold text-gray-800 mb-4"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#374151",
            marginBottom: "16px",
          }}
        >
          프리랜서 목록
        </h2>

        {/* top search bar */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="프리랜서 검색..."
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <select className="rounded-md border px-3 py-2">
              <option>최신순</option>
              <option>평점순</option>
              <option>가격순</option>
            </select>
          </div>
        </div>

        <div
          className="flex space-x-8"
          style={{ display: "flex", gap: "32px" }}
        >
          {/* 좌측 필터 */}
          <aside
            className="w-1/4 bg-white shadow-md rounded-lg p-4"
            style={{
              width: "25%",
              backgroundColor: "white",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold text-gray-800"
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                필터
              </h3>
              <button
                className="p-1 text-sm"
                style={{ border: "none", backgroundColor: "transparent" }}
              >
                초기화
              </button>
            </div>

            {/* filters: checkbox-style controls */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">유형</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  "개인 프리랜서",
                  "팀 프리랜서",
                  "개인사업자",
                  "법인사업자",
                ].map((t) => (
                  <label
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.has(t)}
                      onChange={() => toggleType(t)}
                    />
                    <span style={{ fontSize: "14px", color: "#111827" }}>
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                height: "1px",
                background: "var(--border)",
                margin: "12px 0",
              }}
            />

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">지역</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {["서울", "경기", "강원", "세종", "부산"].map((loc) => (
                  <label
                    key={loc}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocations.has(loc)}
                      onChange={() => toggleLocation(loc)}
                    />
                    <span style={{ fontSize: "14px", color: "#111827" }}>
                      {loc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                height: "1px",
                background: "var(--border)",
                margin: "12px 0",
              }}
            />

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-3">상주 가능</h4>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={showOnlyResident}
                  onChange={() => setShowOnlyResident((s) => !s)}
                />
                <span style={{ fontSize: "14px", color: "#111827" }}>
                  상주 가능한 프리랜서만
                </span>
              </label>
            </div>
          </aside>

          <section className="flex-1">
            <div
              className="bg-white rounded-lg shadow-sm p-6"
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)",
              }}
            >
              {/* results list */}

              <div className="space-y-6">
                {loading ? (
                  <div>로딩중...</div>
                ) : error ? (
                  <div className="text-red-600">에러: {error}</div>
                ) : filteredWithFilters.length === 0 ? (
                  <div className="text-gray-600">검색 결과가 없습니다.</div>
                ) : (
                  filteredWithFilters.map((f) => (
                    <div
                      key={f.id}
                      className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md"
                      style={{
                        display: "flex",
                        gap: "24px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "9999px",
                          overflow: "hidden",
                          background: "#f3f1ee",
                        }}
                      >
                        <img
                          src={fullImageUrl(f.freelancerProfileImageUrl)}
                          alt={f.nickname || "프리랜서"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "center",
                              }}
                            >
                              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                                {f.nickname}
                              </h3>
                              <div
                                style={{ color: "#6b7280", fontSize: "14px" }}
                              >
                                {f.freelancerTitle}
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: "12px",
                                display: "flex",
                                gap: "12px",
                                color: "#6b7280",
                                fontSize: "14px",
                              }}
                            >
                              <div>
                                ⭐{" "}
                                <strong style={{ color: "#f59e0b" }}>
                                  {f.ratingAvg ?? f.rating}
                                </strong>{" "}
                                ({f.reviewCount ?? 0})
                              </div>
                              <div>📍 {f.location}</div>
                              <div>
                                💼 프로젝트 {f.completedProjectsCount ?? 0}건
                              </div>
                            </div>

                            <p style={{ marginTop: "12px", color: "#374151" }}>
                              {f.content ?? f.description}
                            </p>

                            <div
                              style={{
                                marginTop: "12px",
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                              }}
                            >
                              {(f.skills || []).map((s: string) => (
                                <span
                                  key={s}
                                  style={{
                                    fontSize: "12px",
                                    background: "#f1f1f1",
                                    padding: "4px 8px",
                                    borderRadius: "9999px",
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>

                            {/* badges: type and resident availability */}
                            <div
                              style={{
                                marginTop: "12px",
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              {f.type ? (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    background: "#f3f4f6",
                                    color: "#374151",
                                  }}
                                >
                                  {f.type}
                                </span>
                              ) : null}
                              <span
                                style={{
                                  fontSize: "12px",
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                  background:
                                    f.isOnSite || f.isResident || f.isOnsite
                                      ? "#e6f0ff"
                                      : "#f3f4f6",
                                  color:
                                    f.isOnSite || f.isResident || f.isOnsite
                                      ? "#1e3a8a"
                                      : "#6b7280",
                                }}
                              >
                                {f.isOnSite || f.isResident || f.isOnsite
                                  ? "상주 가능"
                                  : "상주 불가능"}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <button
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                borderRadius: "9999px",
                                padding: "8px",
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              ♡
                            </button>
                            <div
                              style={{
                                fontSize: "22px",
                                fontWeight: 800,
                                textAlign: "right",
                              }}
                            >
                              {Math.round(
                                (f.minMonthlyRate ?? f.minRate ?? 0) / 10000
                              ).toLocaleString()}
                              만 ~{" "}
                              {Math.round(
                                (f.maxMonthlyRate ?? f.maxRate ?? 0) / 10000
                              ).toLocaleString()}
                              만
                            </div>
                            <div
                              style={{
                                color: "#6b7280",
                                fontSize: "12px",
                                textAlign: "right",
                              }}
                            >
                              월 단가
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "flex-end",
                                marginTop: "12px",
                              }}
                            >
                              <button>
                                <Link href={`/freelancers/${f.id}`}>
                                  프로필 보기
                                </Link>
                              </button>
                              <button>연락하기</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
