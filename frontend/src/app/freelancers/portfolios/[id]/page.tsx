"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface PortfolioDetail {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  contribution: number;
  imageUrl?: string;
  externalUrl?: string;
}

function fullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// 날짜 포맷: "2025-07-01" -> "25년 07월 01일"
function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear().toString().slice(2);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일`;
}

export default function PortfolioDetailPage({ params }: { params: { id: string } }) {
  // @ts-ignore: keep legacy use(params) call as requested
  const { id } = use(params); // 수정 X
    const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const router = useRouter();

  const handleEdit = () => {
    // navigate to write page with editId to indicate edit flow
    router.push(`/freelancers/portfolios/write?editId=${id}`);
  };

  const handleDelete = async () => {
    const ok = window.confirm("정말 이 포트폴리오를 삭제하시겠습니까? 삭제하면 복구할 수 없습니다.");
    if (!ok) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/portfolios/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`삭제 실패: ${res.status} ${txt}`);
      }
      alert("포트폴리오가 삭제되었습니다.");
      router.push("/freelancers/mypage");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/portfolios/${id}`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) throw new Error("포트폴리오 정보를 불러올 수 없습니다.");
        const data = await res.json();
        setPortfolio(data);
      } catch (err) {
        setPortfolio(null);
      }
    };
    fetchDetail();
  }, [id]);

  if (!portfolio) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f5ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Pretendard', 'Inter', Arial, sans-serif",
        }}
      >
        <div style={{
          background: "#fff",
          borderRadius: "13px",
          boxShadow: "0 2px 14px #0001",
          padding: "48px 46px",
          maxWidth: 540,
          width: "100%",
          fontSize: "1.25rem",
          color: "#888",
          textAlign: "center"
        }}>
          포트폴리오 정보를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f5ec",
        fontFamily: "'Pretendard', 'Inter', Arial, sans-serif",
        padding: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "13px",
          boxShadow: "0 2px 14px #0001",
          padding: "46px 44px",
          maxWidth: 700,
          width: "100%",
        }}
      >
        {/* 제목 최상단 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2
          style={{
            fontSize: "2.2rem",
            fontWeight: 900,
            color: "#222",
            marginBottom: 28,
            letterSpacing: "-1.5px",
            textAlign: "center",
            wordBreak: "break-word"
          }}
        >
          {portfolio.title}
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleEdit} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>수정</button>
            <button onClick={handleDelete} style={{ background: '#fff', color: '#e11d48', border: '1px solid #f3f4f6', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>삭제</button>
          </div>
        </div>
        {/* 대표 이미지 - 더 크게, 꽉차게 */}
        <div style={{
          width: "100%",
          maxWidth: "520px",
          height: "320px",
          margin: "0 auto 32px auto",
          borderRadius: "18px",
          overflow: "hidden",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: portfolio.imageUrl ? "2px solid #16a34a" : "2px dashed #cfd8e3"
        }}>
          {portfolio.imageUrl ? (
            <img
              src={fullImageUrl(portfolio.imageUrl)}
              alt={portfolio.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "18px",
              }}
            />
          ) : (
            <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "18px" }}>
              이미지 없음
            </span>
          )}
        </div>
        {/* 설명 */}
        <div style={{
          color: "#444",
          fontSize: "16px",
          marginBottom: "24px",
          textAlign: "center",
          lineHeight: "1.7",
          background: "#f8faff",
          borderRadius: "10px",
          padding: "15px 20px"
        }}>
          {portfolio.description}
        </div>
        {/* 기간, 기여도 */}
        <div style={{ display: "flex", gap: "18px", marginBottom: "24px", justifyContent: "center" }}>
          <div style={{ color: "#555", fontSize: "16px", fontWeight: 600 }}>
            기간: {formatDate(portfolio.startDate)} ~ {formatDate(portfolio.endDate)}
          </div>
          <div style={{
            background: "#e7e7e7",
            color: "#16a34a",
            fontWeight: 500,
            borderRadius: "8px",
            padding: "5px 10px",
            fontSize: "14px",
          }}>
            {portfolio.contribution}% 기여
          </div>
        </div>
        {/* 외부 링크 */}
        {portfolio.externalUrl && (
          <div style={{ marginTop: "8px", textAlign: "center" }}>
            <a
              href={portfolio.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#16a34a",
                fontWeight: 700,
                fontSize: "16px",
                textDecoration: "underline",
                wordBreak: "break-all"
              }}
            >
              포트폴리오 자세히 보기 &gt;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}