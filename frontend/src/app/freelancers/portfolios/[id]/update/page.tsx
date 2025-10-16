"use client";

import { getTodayString } from "@/utils/dateUtils";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";

interface PortfolioInfo {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  contribution: number;
  externalUrl: string;
  imageFile: File | null;
  imageUrl?: string;
}

const initialState: PortfolioInfo = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  contribution: 0,
  externalUrl: "",
  imageFile: null,
  imageUrl: "",
};

function getFullImageUrl(url?: string) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function PortfolioEditPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const router = useRouter();
  const [info, setInfo] = useState<PortfolioInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [deleteExistingImage, setDeleteExistingImage] = useState(false);

  // 기존 데이터 불러오기
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/portfolios/${id}`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) throw new Error("포트폴리오 정보를 불러올 수 없습니다.");
        const data = await res.json();
        setInfo({ ...data, imageFile: null });
        // 기존 이미지를 항상 제대로 조회해서 표시
        if (data.imageUrl) setPreviewUrl(getFullImageUrl(data.imageUrl));
        else setPreviewUrl(null);
      } catch (e) {
        alert("포트폴리오 정보를 불러올 수 없습니다.");
        setInfo(initialState);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (!info) return;
    setInfo((prev) => ({
      ...prev!,
      [name]:
        type === "number"
          ? Number(value)
          : value,
    }));
  };

  // 이미지 업로드
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    // 새 파일 미리보기
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setDeleteExistingImage(false);
    } else {
      // 기존 이미지로 복구
      setPreviewUrl(info?.imageUrl ? getFullImageUrl(info.imageUrl) : null);
    }
    setInfo((prev) => ({
      ...prev!,
      imageFile: file,
    }));
  };

  // 대표 이미지 삭제 (미리보기 제거, deleteExistingImage true)
  const handleDeleteImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setInfo((prev) => ({ ...prev!, imageFile: null }));
    setDeleteExistingImage(true);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info) return;
    setLoading(true);

    try {
      const formData = new FormData();
      const { imageFile, ...dto } = info;
      formData.append(
        "dto",
        new Blob([JSON.stringify({ ...dto, deleteExistingImage })], { type: "application/json" })
      );
      if (imageFile) formData.append("imageFile", imageFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/portfolios/${id}`,
        { method: "PUT", credentials: "include", body: formData }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `수정에 실패했습니다. (응답: ${res.status}, ${errorText.substring(0, 100)}...)`
        );
      }
      alert("포트폴리오가 성공적으로 수정되었습니다!");
      router.push("/freelancers/mypage");
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!info) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f5ec",
          fontFamily: "'Pretendard', 'Inter', Arial, sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        <div style={{
          background: "#fff",
          borderRadius: "13px",
          boxShadow: "0 2px 14px #0001",
          padding: "44px 38px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
        }}>
          정보를 불러오고 있습니다...
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
          포트폴리오 수정
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
              ref={inputRef}
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
                  position: "relative"
                }}
              >
                {previewUrl ? (
                  <>
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
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        color: "#16a34a",
                        borderRadius: "50%",
                        fontSize: "16px",
                        width: "28px",
                        height: "28px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "17px" }}>
                    이미지 선택 (클릭)
                  </span>
                )}
              </div>
            </label>
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
                onChange={handleChange}
                max={getTodayString()}
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
                onChange={handleChange}
                min={info.startDate}
                max={getTodayString()}
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
            {loading ? "수정 중..." : "수정 완료"}
          </button>
        </form>
      </div>
    </div>
  );
}