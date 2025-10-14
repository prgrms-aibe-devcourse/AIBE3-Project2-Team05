"use client";

import React, { useState } from "react";

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
        프리랜서 정보 입력
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
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
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
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
            지역
          </label>
          <input
            type="text"
            name="location"
            value={info.location}
            onChange={handleChange}
            required
            placeholder="예: 서울"
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 8,
              border: "1px solid #dde1e7",
              fontSize: "1rem",
            }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
            상세 설명
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
          <label style={{ fontWeight: 600 }}>상주 가능</label>
          <input
            type="checkbox"
            name="isOnSite"
            checked={info.isOnSite}
            onChange={handleChange}
            style={{
              accentColor: "#3d7afe",
              width: 20,
              height: 20,
            }}
          />
          <span style={{ color: "#888", fontSize: "0.98rem" }}>
            현장(상주) 근무 가능 여부
          </span>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
            프로필 이미지 (선택)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
            style={{ width: "100%" }}
          />
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
            background: loading ? "#8fb5ff" : "#3d7afe",
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
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
