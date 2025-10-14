"use client";

import { apiFetch } from "@/lib/backend/client";
import Link from "next/link";
import { useEffect, useState } from "react";

const IMAGE_HOST = "http://localhost:8080";

function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${IMAGE_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function FreelancerSearchPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    apiFetch("/api/v1/freelancers").then(setFreelancers);
  }, []);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<string>("최신순");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

  const filtered = freelancers.filter((f) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const name = (f.nickname || "").toString();
    const title = (f.freelancerTitle || "").toString();
    const skills = (f.skills || []).join(" ");
    return (
      name.toLowerCase().includes(q) ||
      title.toLowerCase().includes(q) ||
      skills.toLowerCase().includes(q)
    );
  });

  const filteredWithFilters = filtered.filter((f) => {
    if (selectedTypes.size > 0) {
      const t = f.type || f.freelancerType || "";
      if (!selectedTypes.has(t)) return false;
    }
    if (showOnlyResident) {
      if (!f.isOnSite && !f.isResident && !f.isOnsite) return false;
    }
    if (selectedLocations.size > 0) {
      const loc = (f.location || "").toString();
      if (!selectedLocations.has(loc)) return false;
    }
    return true;
  });

  // 스타일 개선: 카드 여백, 검색 UI 세련되게
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
            letterSpacing: "-2px",
          }}
        >
          프리랜서 목록
        </h2>

        {/* top search bar: 세련된 스타일 */}
        <div
          style={{
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(61,122,254,0.07)",
            padding: "18px 24px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f5f7fa",
                borderRadius: "8px",
                padding: "6px 12px",
                border: "1.5px solid #e5e7eb",
              }}
            >
              <svg
                style={{ marginRight: "8px" }}
                width="22"
                height="22"
                fill="none"
                stroke="#3d7afe"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="프리랜서 이름, 기술 또는 타이틀로 검색"
                className="w-full"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "16px",
                  color: "#222",
                  padding: "4px 0",
                }}
              />
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setIsSortOpen((s) => !s)}
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{
                fontSize: "15px",
                border: "1px solid #e5e7eb",
                background: "#f5f7fa",
                outline: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3d7afe"
                strokeWidth="2"
              >
                <path
                  d="M3 6h18M7 12h10M10 18h4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ color: "#1f2937", fontWeight: 600 }}>{sort}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
              >
                <path
                  d="M6 9l6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isSortOpen && (
              <div
                className="rounded-lg shadow-lg"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  overflow: "hidden",
                  zIndex: 40,
                  minWidth: 160,
                }}
              >
                {[
                  { key: "최신순", label: "최신순" },
                  { key: "평점순", label: "평점순" },
                  { key: "가격순", label: "가격순" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSort(opt.key);
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 15,
                      color: "#111827",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex space-x-8"
          style={{ display: "flex", gap: "32px" }}
        >
          {/* 좌측 필터 */}
          <aside
            className="w-1/4 bg-white shadow-lg rounded-2xl p-6"
            style={{
              width: "25%",
              backgroundColor: "white",
              boxShadow: "0 6px 32px -4px rgba(0,0,0,0.10)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold text-gray-800"
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#374151",
                  letterSpacing: "-1px",
                }}
              >
                필터
              </h3>
              <button
                className="p-1 text-sm text-blue-500 hover:underline"
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  fontWeight: 500,
                }}
                onClick={() => {
                  setSelectedTypes(new Set());
                  setSelectedLocations(new Set());
                  setShowOnlyResident(false);
                }}
              >
                초기화
              </button>
            </div>

            <div className="mb-6">
              <h4
                className="font-semibold text-gray-700 mb-3"
                style={{ fontSize: "15px" }}
              >
                유형
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {["개인", "기업", "팀"].map((t) => (
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
                      style={{
                        accentColor: "#3d7afe",
                        width: "18px",
                        height: "18px",
                        marginRight: "4px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                height: "1px",
                background: "#f3f4f6",
                margin: "12px 0",
              }}
            />

            <div className="mb-6">
              <h4
                className="font-semibold text-gray-700 mb-3"
                style={{ fontSize: "15px" }}
              >
                지역
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  "서울",
                  "부산",
                  "대구",
                  "인천",
                  "광주",
                  "대전",
                  "울산",
                  "세종",
                  "경기",
                  "강원",
                  "충북",
                  "충남",
                  "전북",
                  "전남",
                  "경북",
                  "경남",
                  "제주",
                ].map((loc) => (
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
                      style={{
                        accentColor: "#3d7afe",
                        width: "18px",
                        height: "18px",
                        marginRight: "4px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {loc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                height: "1px",
                background: "#f3f4f6",
                margin: "12px 0",
              }}
            />

            <div className="mb-4">
              <h4
                className="font-semibold text-gray-700 mb-3"
                style={{ fontSize: "15px" }}
              >
                상주 가능
              </h4>
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
                  style={{
                    accentColor: "#3d7afe",
                    width: "18px",
                    height: "18px",
                    marginRight: "4px",
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    fontWeight: 500,
                  }}
                >
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
                      className="bg-white border rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                      style={{
                        display: "flex",
                        gap: "40px",
                        alignItems: "flex-start",
                        border: "1.5px solid #e5e7eb",
                        boxShadow: "0 2px 8px rgba(61,122,254,0.08)",
                        transition: "box-shadow 0.2s, border 0.2s",
                        padding: "40px 36px", // 카드 여백 넓힘
                      }}
                    >
                      <div
                        style={{
                          width: "88px",
                          height: "88px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          background: "#f3f1ee",
                          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={fullImageUrl(f.freelancerProfileImageUrl)}
                          alt={f.nickname || "프리랜서"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
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
                                gap: "16px",
                                alignItems: "center",
                              }}
                            >
                              <h3
                                style={{
                                  fontSize: "21px",
                                  fontWeight: 700,
                                  color: "#222",
                                  letterSpacing: "-1px",
                                }}
                              >
                                {f.nickname}
                              </h3>
                              <span
                                style={{
                                  color: "#3d7afe",
                                  fontSize: "16px",
                                  fontWeight: 500,
                                  background: "#e6f0ff",
                                  borderRadius: "6px",
                                  padding: "3px 12px",
                                }}
                              >
                                {f.freelancerTitle}
                              </span>
                            </div>

                            <div
                              style={{
                                marginTop: "18px",
                                display: "flex",
                                gap: "16px",
                                color: "#6b7280",
                                fontSize: "15px",
                              }}
                            >
                              <div>
                                <span
                                  style={{ color: "#f59e0b", fontWeight: 700 }}
                                >
                                  ⭐ {f.ratingAvg ?? f.rating ?? "0.0"}
                                </span>
                                <span
                                  style={{
                                    marginLeft: "4px",
                                    color: "#9ca3af",
                                  }}
                                >
                                  ({f.reviewCount ?? 0})
                                </span>
                              </div>
                              <div>📍 {f.location}</div>
                              <div>
                                💼 프로젝트 {f.completedProjectsCount ?? 0}건
                              </div>
                            </div>

                            <p
                              style={{
                                marginTop: "18px",
                                color: "#374151",
                                fontSize: "15px",
                                lineHeight: "1.7",
                              }}
                            >
                              {f.content ?? f.description}
                            </p>

                            <div
                              style={{
                                marginTop: "18px",
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {(f.skills || []).map((s: string) => (
                                <span
                                  key={s}
                                  style={{
                                    fontSize: "13px",
                                    background: "#f1f5f9",
                                    color: "#2563eb",
                                    padding: "5px 15px",
                                    borderRadius: "9999px",
                                    fontWeight: 500,
                                    border: "1px solid #e0e7ef",
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>

                            <div
                              style={{
                                marginTop: "18px",
                                display: "flex",
                                gap: "12px",
                                alignItems: "center",
                              }}
                            >
                              {f.type ? (
                                <span
                                  style={{
                                    fontSize: "13px",
                                    padding: "7px 12px",
                                    borderRadius: "8px",
                                    background: "#f3f4f6",
                                    color: "#374151",
                                    fontWeight: 500,
                                  }}
                                >
                                  {f.type}
                                </span>
                              ) : null}
                              <span
                                style={{
                                  fontSize: "13px",
                                  padding: "7px 12px",
                                  borderRadius: "8px",
                                  background:
                                    f.isOnSite || f.isResident || f.isOnsite
                                      ? "#e6f0ff"
                                      : "#f3f4f6",
                                  color:
                                    f.isOnSite || f.isResident || f.isOnsite
                                      ? "#2563eb"
                                      : "#6b7280",
                                  fontWeight: 500,
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
                                marginBottom: "12px",
                                borderRadius: "9999px",
                                padding: "10px",
                                border: "none",
                                background: "#f3f4f6",
                                color: "#e11d48",
                                fontSize: "22px",
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              title="찜하기"
                            >
                              ♥
                            </button>
                            <div
                              style={{
                                fontSize: "26px",
                                fontWeight: 800,
                                textAlign: "right",
                                color: "#222",
                                letterSpacing: "-1px",
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
                                fontSize: "13px",
                                textAlign: "right",
                              }}
                            >
                              월 단가
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "flex-end",
                                marginTop: "18px",
                              }}
                            >
                              <Link href={`/freelancers/${f.id}`}>
                                <button
                                  style={{
                                    background: "#3d7afe",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "8px 22px",
                                    fontWeight: 600,
                                    fontSize: "15px",
                                    boxShadow:
                                      "0 2px 8px rgba(61,122,254,0.10)",
                                    cursor: "pointer",
                                    transition: "background 0.2s",
                                  }}
                                >
                                  프로필 보기
                                </button>
                              </Link>
                              <button
                                style={{
                                  background: "#f3f4f6",
                                  color: "#2563eb",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "8px 22px",
                                  fontWeight: 600,
                                  fontSize: "15px",
                                  cursor: "pointer",
                                  transition: "background 0.2s",
                                }}
                              >
                                연락하기
                              </button>
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
