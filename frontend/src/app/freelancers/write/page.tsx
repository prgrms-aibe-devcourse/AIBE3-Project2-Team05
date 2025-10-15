"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

interface FreelancerInfo {
  freelancerTitle: string;
  type: string;
  location: string;
  content: string;
  isOnSite: boolean;
  minMonthlyRate: number;
  maxMonthlyRate: number;
}

const initialState: FreelancerInfo = {
  freelancerTitle: "",
  type: "",
  location: "",
  content: "",
  isOnSite: false,
  minMonthlyRate: 0,
  maxMonthlyRate: 0,
};

export default function FreelancerWritePage() {
  const [info, setInfo] = useState<FreelancerInfo>(initialState);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;

    setInfo({
      ...info,
      [name]:
        type === "checkbox"
          ? checked
          : name === "minMonthlyRate" || name === "maxMonthlyRate"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "dto",
        new Blob([JSON.stringify(info)], { type: "application/json" })
      );
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers`,
        { method: "POST", credentials: "include", body: formData }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `등록에 실패했습니다. (응답: ${res.status}, ${errorText.substring(0, 100)}...)`
        );
      }

      // try to parse response to get saved freelancer id
      let saved: any = null;
      try {
        saved = await res.json();
      } catch (e) {
        saved = null;
      }

      alert("프리랜서 정보가 성공적으로 등록되었습니다!");
      setInfo(initialState);
      setImageFile(null);
      setPreviewUrl(null);

      const savedId = saved?.id ?? saved?.freelancerId ?? saved?.data?.id ?? null;
      const target = savedId
        ? `/freelancers/portfolios/write?freelancerId=${savedId}`
        : `/freelancers/portfolios/write`;
      router.push(target);
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
          maxWidth: 560,
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
          프리랜서 등록
        </h2>
        <form onSubmit={handleSubmit}>
          {/* 이미지, 닉네임, 타이틀 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* 프로필 이미지 업로드 */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer?.files?.[0] ?? null;
                if (f && f.type.startsWith("image/")) {
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  const url = URL.createObjectURL(f);
                  setPreviewUrl(url);
                  setImageFile(f);
                  if (inputRef.current) inputRef.current.value = "";
                }
              }}
              style={{
                width: 92,
                height: 92,
                borderRadius: "18px",
                background: "#f1f5f9",
                overflow: "hidden",
                border: previewUrl ? "2px solid #16a34a" : "2px dashed #cfd8e3",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 8px #0001",
                position: "relative",
              }}
            >
              <input
                id="profile-image"
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                  } else {
                    setPreviewUrl(null);
                  }
                  setImageFile(file);
                }}
                style={{ display: "none" }}
              />
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="선택한 프로필 이미지 미리보기"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px" }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      setImageFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    aria-label="이미지 제거"
                    style={{
                      position: "absolute",
                      top: 7,
                      right: 7,
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
                <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "15px" }}>
                  IMG
                </span>
              )}
            </div>
            {/* 닉네임/타이틀 입력 */}
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
                프리랜서/팀 타이틀
              </label>
              <input
                type="text"
                name="freelancerTitle"
                value={info.freelancerTitle}
                onChange={handleChange}
                required
                placeholder="예: 모바일 앱 개발자"
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 8,
                  border: "1px solid #dde1e7",
                  fontSize: "1rem",
                  marginBottom: "9px",
                  fontWeight: 600,
                }}
              />
              <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
                지역
              </label>
              <input
                type="text"
                name="location"
                value={info.location}
                onChange={handleChange}
                required
                placeholder="예: 서울, 경기"
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
          </div>
          {/* 구분 */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}
            >
              구분
            </label>
            <select
              name="type"
              value={info.type}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 8,
                border: "1px solid #dde1e7",
                fontSize: "1rem",
                background: "#fff",
                fontWeight: 500,
              }}
            >
              <option value="">선택하세요</option>
              <option value="개인">개인</option>
              <option value="기업">기업</option>
              <option value="팀">팀</option>
            </select>
          </div>
          {/* 소개 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 700, marginBottom: 6, display: "block", color: "#333" }}>
              소개
            </label>
            <textarea
              name="content"
              value={info.content}
              onChange={handleChange}
              required
              rows={5}
              placeholder="팀/프리랜서의 전문 분야, 경험, 서비스 등 상세 설명을 입력하세요."
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 8,
                border: "1px solid #dde1e7",
                fontSize: "1rem",
                resize: "vertical",
                fontWeight: 500,
              }}
            />
          </div>
          {/* 상주 가능 */}
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <label style={{ fontWeight: 700, color: "#333" }}>상주 가능 여부</label>
            <input
              type="checkbox"
              name="isOnSite"
              checked={info.isOnSite}
              onChange={handleChange}
              style={{
                accentColor: "#16a34a",
                width: 20,
                height: 20,
              }}
            />
            <span style={{ color: "#888", fontSize: "0.98rem" }}>
              프로젝트 참여 가능한 상태라면 체크해주세요
            </span>
          </div>
          {/* 월 단가 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6, color: "#333" }}>
              월 단가 (만원)
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="number"
                name="minMonthlyRate"
                value={info.minMonthlyRate * 10000}
                onChange={handleChange}
                required
                min={0}
                placeholder="최소"
                style={{
                  width: "50%",
                  padding: "11px",
                  borderRadius: 8,
                  border: "1px solid #dde1e7",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              />
              <input
                type="number"
                name="maxMonthlyRate"
                value={info.maxMonthlyRate}
                onChange={handleChange}
                required
                min={0}
                placeholder="최대"
                style={{
                  width: "50%",
                  padding: "11px",
                  borderRadius: 8,
                  border: "1px solid #dde1e7",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              />
            </div>
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
            {loading ? "등록 중..." : "이어서 포트폴리오 등록하러 가기"}
          </button>
        </form>
      </div>
    </div>
  );
}