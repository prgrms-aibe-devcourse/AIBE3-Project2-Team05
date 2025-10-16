import { useState } from "react";

interface Tech {
  id: string | number;
  techName: string;
}

type TechLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export default function TechAddModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (tech: Tech & { techLevel: TechLevel }) => void;
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Tech[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<Record<string | number, TechLevel>>({});

  // 검색 실행
  const handleSearch = async (keyword: string) => {
    setSearching(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/techs?keyword=${encodeURIComponent(keyword)}`,
        { method: "GET", credentials: "include" }
      );
      if (!res.ok) throw new Error("검색 실패");
      const techs = await res.json();
      setResults(techs || []);
      // 초기값 세팅 (없으면 BEGINNER로)
      const initialLevels: Record<string | number, TechLevel> = {};
      techs.forEach((tech: Tech) => {
        initialLevels[tech.id] = selectedLevels[tech.id] ?? "BEGINNER";
      });
      setSelectedLevels(initialLevels);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  // 추가 버튼 클릭
  const handleAdd = async (tech: Tech) => {
    const techLevel: TechLevel = selectedLevels[tech.id] || "BEGINNER";
    setLoading(true);
    try {
      // 실제 추가 API 호출: (예시) POST /api/v1/freelancers/me/techs
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me/techs`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ techId: tech.id, techLevel }),
        }
      );
      const data = await res.json();
      if (data.statusCode == 400) {
        alert("이미 추가된 기술스택입니다.");
        setLoading(false);
        return;
      }
      onAdd({ ...tech, techLevel });
      onClose();
      alert("기술스택이 성공적으로 추가되었습니다.");
    } catch {
      alert("기술스택 추가에 실패했습니다.");
    }
    setLoading(false);
  };

  // techLevel 변경
  const handleLevelChange = (techId: string | number, value: TechLevel) => {
    setSelectedLevels((prev) => ({
      ...prev,
      [techId]: value,
    }));
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
        }}>기술스택 추가</h3>
        <div style={{ marginBottom: 18 }}>
          <input
            type="text"
            value={search}
            placeholder="기술스택 검색 (예: React, Spring 등)"
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value.trim().length > 0) {
                handleSearch(e.target.value.trim());
              } else {
                setResults([]);
              }
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 7,
              border: "1px solid #dde1e7",
              fontSize: "1rem",
              marginBottom: "6px"
            }}
          />
        </div>
        {searching ? (
          <div style={{ textAlign: "center", color: "#888", marginBottom: "10px" }}>검색 중...</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {results.length === 0 && search.length > 0 && (
              <li style={{ color: "#aaa", textAlign: "center", marginTop: 8 }}>검색 결과 없음</li>
            )}
            {results.map((tech) => (
              <li
                key={tech.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: "15px"
                }}
              >
                <span style={{ fontWeight: 600 }}>{tech.techName}</span>
                <div style={{ display: "flex", alignItems: "center" }}>
                <select
                  style={{ marginLeft: 10, padding: "2px 7px", borderRadius: 5, border: "1px solid #dde1e7", fontSize: "13px" }}
                  value={selectedLevels[tech.id] || "BEGINNER"}
                  onChange={e => handleLevelChange(tech.id, e.target.value as TechLevel)}
                >
                  <option value="BEGINNER">초급</option>
                  <option value="INTERMEDIATE">중급</option>
                  <option value="ADVANCED">고급</option>
                </select>
                <button
                  type="button"
                  disabled={loading}
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "7px",
                    padding: "3px 12px",
                    fontWeight: 700,
                    fontSize: "13px",
                    marginLeft: "10px",
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                  onClick={() => handleAdd(tech)}
                >
                  추가
                </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          style={{
            background: "#f3f4f6",
            color: "#888",
            border: "none",
            borderRadius: "8px",
            padding: "10px 0px",
            fontWeight: 700,
            fontSize: "16px",
            width: "100%",
            marginTop: "12px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}