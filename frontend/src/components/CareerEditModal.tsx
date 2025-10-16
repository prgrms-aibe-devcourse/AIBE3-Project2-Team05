import React, { useEffect, useState } from "react";

interface CareerEditModalProps {
  id: string | number;
  onClose: () => void;
  onEdit: (career: any) => void;
}

export default function CareerEditModal({ id, onClose, onEdit }: CareerEditModalProps) {
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
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // id로 경력 데이터 fetch
    async function fetchCareer() {
      setInitialLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/careers/${id}`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) throw new Error("경력 정보를 불러올 수 없습니다.");
        const data = await res.json();
        setForm({
          title: data.title ?? "",
          company: data.company ?? "",
          position: data.position ?? "",
          startDate: data.startDate ?? "",
          endDate: data.endDate ?? "",
          current: !!data.current,
          description: data.description ?? "",
        });
      } catch (err) {
        alert("경력 정보를 불러올 수 없습니다.");
        onClose();
      }
      setInitialLoading(false);
    }
    fetchCareer();
  }, [id, onClose]);

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
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/careers/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("경력 수정에 실패했습니다.");
      const updatedCareer = await res.json();
      onEdit(updatedCareer);
      onClose();
    } catch (err) {
      alert("경력 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
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
            position: "relative",
            textAlign: "center"
          }}
        >
          <span>경력 정보를 불러오는 중...</span>
        </div>
      </div>
    );

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
        }}>경력 수정</h3>
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
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
                type="button"
                disabled={loading}
                style={{
                background: "#f3f4f6",
                color: "#e11d48",
                border: "none",
                borderRadius: "8px",
                padding: "12px 0px",
                fontWeight: 700,
                fontSize: "16px",
                width: "100%",
                cursor: loading ? "not-allowed" : "pointer",
                flex: 1
                }}
                onClick={async () => {
                if (!window.confirm("정말 삭제하시겠습니까?")) return;
                // 삭제 API 호출 예시
                try {
                    // setLoading(true);
                    const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/careers/${id}`,
                    { method: "DELETE", credentials: "include" }
                    );
                    if (!res.ok) throw new Error("삭제에 실패했습니다.");
                    alert("경력이 삭제되었습니다.");
                    onClose(); 
                    onEdit(null); // 부모 컴포넌트에서 해당 경력을 목록에서 제거하도록 처리
                } catch (err) {
                    alert("삭제 실패");
                } finally {
                    setLoading(false);
                }
                }}
            >
                삭제
            </button>
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
                cursor: loading ? "not-allowed" : "pointer",
                flex: 1
                }}
            >
                {loading ? "저장 중..." : "저장"}
            </button>
            </div>
        </form>
      </div>
    </div>
  );
}