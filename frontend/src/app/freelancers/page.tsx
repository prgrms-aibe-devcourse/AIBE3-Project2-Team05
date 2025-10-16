"use client";

import { apiFetch } from "@/lib/backend/client";
import Link from "next/link";
import { useEffect, useState } from "react";

// 이미지 처리 함수 
function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8080${url.startsWith("/") ? "" : "/"}${url}`;
}

const TYPE_OPTIONS = ["전체", "기획", "디자인", "개발"];
const LOCATION_OPTIONS = [
  "전체", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
];

export default function FreelancerSearchPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("전체");
  const [selectedLocation, setSelectedLocation] = useState<string>("전체");
  const [showOnlyResident, setShowOnlyResident] = useState<boolean>(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/v1/freelancers")
      .then(setFreelancers)
      .catch(e => setError("데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  // 검색/필터
  const filtered = freelancers.filter((f) => {
    // 검색어
    if (query) {
      const q = query.toLowerCase();
      const name = (f.nickname || "").toString().toLowerCase();
      const title = (f.freelancerTitle || "").toString().toLowerCase();
      const content = (f.content || f.description || "").toString().toLowerCase();
      // techList 내부의 techName, techCategory 모두 검색에 포함
      const teches = (f.techList || [])
        .map((t: any) => `${(t.techName || "").toString()} ${(t.techCategory || t.category || "").toString()}`)
        .join(" ")
        .toLowerCase();

      if (!(
        name.includes(q) ||
        title.includes(q) ||
        content.includes(q) ||
        teches.includes(q)
      )) return false;
    }
    // 유형
    if (selectedType !== "전체" && f.type !== selectedType) return false;
    // 지역
    if (selectedLocation !== "전체" && f.location !== selectedLocation)
      return false;
    // 상주
    if (showOnlyResident && !f.isOnSite && !f.isResident && !f.isOnsite)
      return false;
    return true;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f5ec",
        padding: "0",
        fontFamily: "'Pretendard', 'Inter', Arial, sans-serif",
      }}
    >
      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "40px 0",
          display: "flex",
          gap: "32px",
        }}
      >
        {/* 좌측 필터 */}
        <aside
          style={{
            width: 320,
            minWidth: 260,
            background: "#fff",
            borderRadius: "13px",
            boxShadow: "0 2px 12px #0001",
            padding: "32px 24px",
            marginTop: "10px",
            height: "fit-content",
          }}
        >
          <h2 style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            marginBottom: "22px",
            color: "#444",
            letterSpacing: "-1px"
          }}>
            프리랜서 필터
          </h2>
          {/* 유형 */}
          <div style={{ marginBottom: "26px" }}>
            <div style={{ fontWeight: 700, marginBottom: "10px", fontSize: "1.05rem", color: "#525252" }}>유형</div>
            {TYPE_OPTIONS.map((t) => (
              <label key={t} style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                fontWeight: t === selectedType ? 700 : 500,
                color: t === selectedType ? "#1a3c2b" : "#666",
                cursor: "pointer",
                fontSize: "15px",
              }}>
                <input
                  type="radio"
                  name="type"
                  checked={selectedType === t}
                  onChange={() => setSelectedType(t)}
                  style={{ accentColor: "#ed6a23", marginRight: "8px" }}
                />
                {t}
              </label>
            ))}
          </div>
          {/* 지역 */}
          <div style={{ marginBottom: "26px" }}>
            <div style={{ fontWeight: 700, marginBottom: "10px", fontSize: "1.05rem", color: "#525252" }}>지역</div>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "7px",
                border: "1px solid #e7e7e7",
                background: "#f7f7f7",
                fontSize: "15px",
                color: "#444",
              }}
            >
              {LOCATION_OPTIONS.map(loc =>
                <option key={loc} value={loc}>{loc}</option>
              )}
            </select>
          </div>
          {/* 상주 필터 */}
          <div style={{ marginBottom: "22px" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "15px",
              color: showOnlyResident ? "#ed6a23" : "#444"
            }}>
              <input
                type="checkbox"
                checked={showOnlyResident}
                onChange={() => setShowOnlyResident(s => !s)}
                style={{ accentColor: "#ed6a23" }}
              />
              상주 가능만 보기
            </label>
          </div>
        </aside>

        {/* 우측 결과 */}
        <section style={{ flex: 1 }}>
          <div style={{
            marginBottom: "32px",
            padding: "0 16px",
          }}>
            <h2 style={{
              fontSize: "1.7rem",
              fontWeight: 800,
              color: "#333",
              marginBottom: "18px",
              letterSpacing: "-1px",
            }}>
              프리랜서를 찾아보세요.
            </h2>
            <div style={{
              padding: "16px 18px",
              background: "#fff",
              borderRadius: "13px",
              boxShadow: "0 2px 12px #0001",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="검색어를 입력하세요."
                style={{
                  flex: 1,
                  fontSize: "16.5px",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e7e7e7",
                  background: "#f8f8f8",
                  color: "#333",
                  marginRight: "10px"
                }}
              />
              <button
                type="button"
                style={{
                  background: "#ed6a23",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "16px",
                  padding: "9px 26px",
                  boxShadow: "0 1px 6px #ed6a2322",
                  cursor: "pointer"
                }}
                onClick={() => setQuery(query)}
              >검색</button>
            </div>
          </div>

          {/* 프리랜서 카드 리스트 */}
          <div style={{
            minHeight: 350,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "32px"
          }}>
            {loading ? (
              <div style={{
                gridColumn: "1/4",
                textAlign: "center",
                color: "#ed6a23",
                fontSize: "1.2rem",
                padding: "60px 0"
              }}>로딩중...</div>
            ) : error ? (
              <div style={{
                gridColumn: "1/4",
                textAlign: "center",
                color: "#e11d48",
                fontSize: "1.2rem",
                padding: "60px 0"
              }}>{error}</div>
            ) : filtered.length === 0 ? (
              <div style={{
                gridColumn: "1/4",
                textAlign: "center",
                color: "#888",
                fontSize: "1.2rem",
                padding: "60px 0"
              }}>검색 결과가 없습니다.</div>
            ) : (
              filtered.map(f => (
                <div key={f.id} style={{
                  background: "#fff",
                  borderRadius: "13px",
                  boxShadow: "0 2px 12px #0001",
                  padding: "18px 23px",
                  display: "flex",
                  flexDirection: "column",
                  height: "320px", // 고정 높이
                  gap: "10px",
                  overflow: "hidden",
                }}>
                  {/* 이미지, 닉네임, 타이틀 가로배치 */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    marginBottom: "14px"
                  }}>
                    {/* 프로필 이미지 */}
                    <div style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      background: "#f7f7f7",
                      flexShrink: 0,
                    }}>
                      <img
                        src={
                    f?.freelancerProfileImageUrl
                            ? fullImageUrl(f.freelancerProfileImageUrl)
                            : "/logo-full.png"
                        }
                        alt={f.nickname || "프리랜서"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    {/* 닉네임+타이틀 */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: "1.15rem",
                        color: "#222",
                        marginBottom: "3px"
                      }}>{f.nickname}</div>
                      <div style={{
                        color: "#ed6a23",
                        fontWeight: 700,
                        fontSize: "16px",
                        marginTop: "10px"
                      }}>{f.freelancerTitle}</div>
                    </div>
                  </div>
                  {/* 기타 정보 */}
                  <div style={{
                    display: "flex",
                    gap: "5px",
                    fontSize: "15px",
                    color: "#666",
                    marginBottom: "7px"
                  }}>
                    <span style={{ color: "#f59e0b" }}>★ {f.ratingAvg ?? f.rating ?? "0.0"}</span>
                    <span>({f.reviewsCount ?? f.reviewsCount ?? 0})</span>
                    <span style={{marginLeft: "40px"}}>🇰🇷 {f.location}</span>
                    <span style={{marginLeft: "40px"}}>👨‍💻 {f.type}</span>
                  </div>
                  {/* 카드 본문 */}
                  <div style={{
                    color: "#555",
                    fontSize: "15px",
                    marginBottom: "1px",
                    minHeight: "38px",
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word'
                  }}>{f.content ?? f.description}</div>
                  {/* 기술 태그 (한 줄로 표시, 우선순위: ADVANCED > INTERMEDIATE > BEGINNER) */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      title={(f.techList || []).map((t: any) => t.techName).join(", ")}
                      style={{
                        display: "flex",
                        gap: "7px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        marginBottom: "10px"
                      }}
                    >
                      {(f.techList || []).slice().sort((a: any, b: any) => {
                        const order = (lvl: string) => {
                          const v = (lvl || "").toUpperCase();
                          if (v === "ADVANCED") return 0;
                          if (v === "INTERMEDIATE") return 1;
                          if (v === "BEGINNER") return 2;
                          return 3;
                        };
                        return order(a.techLevel || a.level) - order(b.techLevel || b.level);
                      }).map((s: any, idx: number) => (
                        <span
                          key={s.id ?? idx}
                          style={{
                            display: "inline-block",
                            background: "#f7f7f7",
                            fontWeight: 600,
                            borderRadius: "8px",
                            padding: "5px 13px",
                            fontSize: "13px",
                            marginRight: "6px",
                          }}
                        >{s.techName}</span>
                      ))}
                    </div>
                  </div>
                  {/* 액션/단가 */}
                  <div style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                      }}>
                        {Math.round((f.minMonthlyRate ?? f.minRate ?? 0) / 10000).toLocaleString()}만 ~{" "}
                        {Math.round((f.maxMonthlyRate ?? f.maxRate ?? 0) / 10000).toLocaleString()}만
                      </div>
                      <div style={{ fontSize: "13px", color: "#999" }}>월 단가</div>
                    </div>
                    <div style={{ display: "flex", gap: "7px" }}>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "center", background: "#f8faff",
                        borderRadius: "8px",
                        padding: "7px 8px",
                        fontSize: "22px",
                        fontWeight: 800,
                        marginRight: "10px",
                        color: "#16a34a",
                        letterSpacing: "-1px",
                        position: "relative", }}>
                          <span style={{
                            display: "block",
                            fontSize: "15px",
                            fontWeight: 800,
                            color: f?.isOnSite ? "#16a34a" : "#7b898dff",
                          }}>
                            {f?.isOnSite ? "상주" : "작업중"}
                          </span>
                        </div>
                      <Link href={`/freelancers/${f.id}`}>
                        <button
                          style={{
                            background: "#ed6a23",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "7px 18px",
                            fontWeight: 700,
                            fontSize: "15px",
                            cursor: "pointer",
                          }}
                        >프로필</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}