"use client";

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

export default function FreelancerDetailPage() {
  const [info, setInfo] = useState<FreelancerInfo>(initialState);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

      console.log("imageFile type:", typeof imageFile);
      if (imageFile) {
        console.log("imageFile instanceof File:", imageFile instanceof File);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers`,
        { method: "POST", credentials: "include", body: formData }
      );

      if (!res.ok) {
        // 서버의 응답을 확인하여 더 구체적인 에러 메시지 제공 가능
        const errorText = await res.text();
        throw new Error(
          `등록에 실패했습니다. (응답: ${res.status}, ${errorText.substring(
            0,
            100
          )}...)`
        );
      }

      alert("프리랜서 정보가 성공적으로 등록되었습니다!");
      setInfo(initialState);
      setImageFile(null);
    } catch (error: any) {
      alert(error.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-[#f8f4eb]"
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: "32px",
        borderRadius: 18,
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          marginBottom: 12,
          fontWeight: 700,
          color: "#222",
        }}
      >
        프리랜서 등록
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
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
            }}
          />
        </div>
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{ fontWeight: 600, marginBottom: 6, display: "block" }}
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
              }}
            >
              <option value="">선택하세요</option>
              <option value="개인">개인</option>
              <option value="기업">기업</option>
              <option value="팀">팀</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{ fontWeight: 600, marginBottom: 6, display: "block" }}
            >
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
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
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
            }}
          />
        </div>
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <label style={{ fontWeight: 600 }}>상주 가능 여부</label>
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
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="profile-image"
            style={{ fontWeight: 600, marginBottom: 6, display: "block" }}
          >
            프로필 이미지 (선택)
          </label>

          <input
            id="profile-image"
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }
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
                // clear native input value so same file can be re-selected later if needed
                if (inputRef.current) inputRef.current.value = "";
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 12,
              padding: 12,
              borderRadius: 8,
              border: "1px dashed #cfd8e3",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {previewUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={previewUrl}
                  alt="선택한 프로필 이미지 미리보기"
                  style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 8 }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 600 }}>{imageFile?.name}</div>
                  <div style={{ color: "#666", fontSize: "0.9rem" }}>
                    {(imageFile && `${Math.round(imageFile.size / 1024)} KB`) || "이미지 선택됨"}
                  </div>
                </div>
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
                    marginLeft: 8,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  제거
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  IMG
                </div>
                <div style={{ color: "#666" }}>
                  <div style={{ fontWeight: 600 }}>이미지를 드래그하거나 클릭하여 업로드</div>
                  <div style={{ fontSize: "0.9rem" }}>권장: JPG, PNG (최대 5MB)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            월 단가 (만원)
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="number"
              name="minMonthlyRate"
              value={info.minMonthlyRate}
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
            fontSize: "1.08rem",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(61,122,254,0.10)",
            marginTop: 12,
            transition: "background 0.2s",
          }}
        >
          {loading ? "등록 중..." : "이어서 포트폴리오 등록하러 가기"}
        </button>
      </form>
    </div>
  );
}
