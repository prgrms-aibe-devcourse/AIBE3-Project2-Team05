import React, { useState } from "react";

export default function CareerAddModal({ onClose, onAdd }: { onClose: () => void, onAdd: (career: any) => void }) {
  const [form, setForm] = useState({
    title: "",
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // 실제 API 등록 로직 onAdd(form)
    try {
      await onAdd(form);
      onClose();
    } catch (err) {
      alert("경력 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(40,40,40,0.18)",
        zIndex: 99,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "13px",
          boxShadow: "0 2px 18px #16a34a33",
          minWidth: 380,
          maxWidth: 540,
          width: "100%",
          padding: "32px 28px",
          position: "relative"
        }}
      >
        <button
          style={{
            position: "absolute", right: 18, top: 16,
            background: "none", border: "none",
            fontSize: "22px", color: "#888", cursor: "pointer"
          }}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
        <h3 style={{
          fontWeight: 800, fontSize: "20px", marginBottom: "20px", color: "#16a34a", textAlign: "center"
        }}>경력 추가</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 700, color: "#222", fontSize: "15px", marginBottom: 4, display: "block" }}>경력명</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="예: 풀 개발자"
              style={{ width: "100%", padding: "10px", borderRadius: 7, border: "1px solid #dde1e7", fontSize: "1rem" }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 700, color: "#222", fontSize: "15px", marginBottom: 4, display: "block" }}>회사명</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              placeholder="회사명"
              style={{ width: "100%", padding: "10px", borderRadius: 7, border: "1px solid #dde1e7", fontSize: "1rem" }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 700, color: "#222", fontSize: "15px", marginBottom: 4, display: "block" }}>직급</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              required
              placeholder="예: 사원, 주임, 대리"
              style={{ width: "100%", padding: "10px", borderRadius: 7, border: "1px solid #dde1e7", fontSize: "1rem" }}
            />
          </div>
          <div style={{ marginBottom: 14, display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 700, color: "#222", fontSize: "15px", marginBottom: 4, display: "block" }}>시작일</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: 7, border: "1px solid #dde1e7", fontSize: "1rem" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 700, color: "#222", fontSize: "15px", marginBottom: 4, display: "block" }}>종료일</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                disabled={form.current}
                required={!form.current}
                style={{ width: "100%", padding: "10px", borderRadius: 7, border: "1px solid #dde1e7", fontSize: "1rem", background: form.current ? "#f3f4f6" : "#fff" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 700, color: "#222", fontSize: "15px", marginBottom: 4, display: "block" }}>
              <input
                type="checkbox"
                name="current"
                checked={form.current}
                onChange={handleChange}
                style={{ marginRight: 7 }}
              />
              재직중
            </label>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 700, color: "#222", fontSize: "15px", marginBottom: 4, display: "block" }}>상세 설명</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="회사에서 담당했던 업무, 프로젝트 등"
              style={{ width: "100%", padding: "10px", borderRadius: 7, border: "1px solid #dde1e7", fontSize: "1rem", resize: "vertical" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#8fb5ff" : "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 0px",
              fontWeight: 700,
              fontSize: "16px",
              width: "100%",
              marginTop: "10px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>
    </div>
  );
}