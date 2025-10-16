"use client";

import { getTodayString } from '@/utils/dateUtils';
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface PortfolioInfo {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  contribution: number;
  externalUrl: string;
  imageFile: File | null;
}

const initialState: PortfolioInfo = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  contribution: 0,
  externalUrl: "",
  imageFile: null,
};

export default function PortfolioWritePage() {
  const [info, setInfo] = useState<PortfolioInfo>(initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setInfo((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    setInfo((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      const { imageFile, ...dto } = info;
      formData.append(
        "dto",
        new Blob([JSON.stringify(dto)], { type: "application/json" })
      );
      if (imageFile) formData.append("imageFile", imageFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/portfolios`,
        { method: "POST", credentials: "include", body: formData }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `등록에 실패했습니다. (응답: ${res.status}, ${errorText.substring(0, 100)}...)`
        );
      }
      alert("포트폴리오가 성공적으로 등록되었습니다!");
      setInfo(initialState);
      setPreviewUrl(null);
  // redirect to mypage
  router.push("/freelancers/mypage");
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

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
          padding: "44px 38px",
          maxWidth: 520,
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#222",
            marginBottom: 24,
            letterSpacing: "-1px",
            textAlign: "left",
          }}
        >
          포트폴리오 등록
        </h2>
        <form onSubmit={handleSubmit}>
          {/* 이미지 업로드 */}
          <div style={{ marginBottom: 28 }}>
            <label
              style={{ fontWeight: 700, marginBottom: 8, display: "block", color: "#333" }}
            >
              대표 이미지 (선택)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="portfolio-image"
            />
            <label htmlFor="portfolio-image" style={{ cursor: "pointer" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  height: "170px",
                  borderRadius: "12px",
                  background: "#f1f5f9",
                  border: previewUrl ? "2px solid #16a34a" : "2px dashed #cfd8e3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="포트폴리오 미리보기"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                ) : (
                  <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "17px" }}>
                    이미지 선택 (클릭)
                  </span>
                )}
              </div>
            </label>
            {previewUrl && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setInfo((prev) => ({ ...prev, imageFile: null }));
                  }}
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    color: "#16a34a",
                    borderRadius: "7px",
                    fontSize: "15px",
                    padding: "6px 18px",
                    cursor: "pointer",
                    marginLeft: "2px",
                  }}
                >
                  이미지 제거
                </button>
              </div>
            )}
          </div>

          {/* 제목 */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
              제목
            </label>
            <input
              type="text"
              name="title"
              value={info.title}
              onChange={handleChange}
              required
              placeholder="포트폴리오 제목을 입력하세요"
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 8,
                border: "1px solid #dde1e7",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            />
          </div>
          {/* 설명 */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
              설명
            </label>
            <textarea
              name="description"
              value={info.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="포트폴리오 상세 내용을 입력하세요"
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 8,
                border: "1px solid #dde1e7",
                fontSize: "1rem",
                fontWeight: 500,
                resize: "vertical",
              }}
            />
          </div>
          {/* 기간 (년 월 일) */}
          <div style={{ marginBottom: 18, display: "flex", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
                시작
              </label>
              <input
                type="date"
                name="startDate"
                value={info.startDate}
                max={getTodayString()}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 8,
                  border: "1px solid #dde1e7",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
                종료
              </label>
              <input
                type="date"
                name="endDate"
                value={info.endDate}
                min={info.startDate}
                max={getTodayString()}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 8,
                  border: "1px solid #dde1e7",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>
          {/* 기여도 */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
              기여도 (%)
            </label>
            <input
              type="number"
              name="contribution"
              value={info.contribution}
              onChange={handleChange}
              min={0}
              max={100}
              required
              placeholder="기여율"
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 8,
                border: "1px solid #dde1e7",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            />
          </div>
          {/* 외부 링크 */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
              외부 링크 (선택)
            </label>
            <input
              type="text"
              name="externalUrl"
              value={info.externalUrl}
              onChange={handleChange}
              placeholder="외부 포트폴리오 URL (선택)"
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 8,
                border: "1px solid #dde1e7",
                fontSize: "1rem",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              background: loading ? "#8fb5ff" : "#16a34a",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.13rem",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px #16a34a22",
              marginTop: 18,
              transition: "background 0.2s",
            }}
          >
            {loading ? "등록 중..." : "포트폴리오 등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}