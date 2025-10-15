"use client";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MyPage() {
  const { username, memberId, roles, setUsername, isLoaded } = useUser();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const [modalType, setModalType] = useState<"project" | "portfolio" | null>(null);

  const hasPM = roles.includes("PM");
  const hasFreelancer = roles.includes("FREELANCER");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/me`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();

        if (!res.ok) {
          setMsg(data.msg || "정보를 불러오지 못했습니다.");
          return;
        }

        const member = data.Data;
        if (member) {
          setUsername(member.username ?? "");
          setNickname(member.nickname ?? "");
          setEmail(member.email ?? "");
        } else {
          setMsg("회원 정보를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error(err);
        setMsg("정보 불러오기 중 오류 발생");
      }
    };

    if (!isLoaded) return;
    fetchMe();
  }, [setUsername, isLoaded]);

  const handleProjectClick = () => {
    if (hasPM) {
      window.location.href = `/user-projects/${memberId}`;
    } else {
      setModalType("project");
    }
  };

  const handlePortfolioClick = () => {
    if (hasFreelancer) {
      window.location.href = `/freelancers/mypage`;
    } else {
      setModalType("portfolio");
    }
  };

  const handleModalCreate = () => {
    if (modalType === "project") {
      window.location.href = "/projects/create";
    } else if (modalType === "portfolio") {
      window.location.href = "/freelancers/write";
    }
  };

  if (!isLoaded)
    return <p className="text-center mt-20 text-gray-600">로딩 중...</p>;

  return (
    <div
      className="min-h-screen bg-[#f8f4eb] flex justify-center"
      style={{
        paddingTop: "68px",
        paddingBottom: "180px",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
    >
      <div className="w-full max-w-[1100px]">
        {/* 제목 */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 className="text-[26px] font-extrabold text-[#1E1B16]" style={{ marginBottom: "0.25rem" }}>
            마이페이지
          </h1>
          <p className="text-[#6A6558] text-[15px] font-[400]">
            프로필 정보와 활동 현황을 관리하세요
          </p>
        </div>

        {msg && (
          <p className="text-red-500 text-sm" style={{ marginBottom: "1rem" }}>
            {msg}
          </p>
        )}

        {/* 카드 레이아웃 */}
        <div className="flex items-stretch" style={{ gap: "1.5rem" }}>
          {/* 왼쪽 카드 */}
          <div className="flex-[1.2] bg-[#FFFFFF] border border-[#E8E3D9] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-start" style={{ padding: "3.5rem", minHeight: "520px" }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
                <Image src="/id.png" alt="id icon" width={20} height={20} className="object-contain" />
                <h2 className="text-[15px] font-bold text-[#1E1B16]">기본 정보</h2>
              </div>
              <p className="text-[#6A6558] text-[13px]" style={{ marginBottom: "2rem" }}>
                개인 정보를 관리하고 업데이트하세요
              </p>

              <div className="border-b border-[#E8E3D9]" style={{ paddingBottom: "1.25rem", marginBottom: "2.5rem" }}>
                <span className="text-[17px] font-bold text-[#1E1B16]">{username}</span>
              </div>

              <div className="grid grid-cols-2" style={{ columnGap: "2rem", rowGap: "2.5rem", marginTop: "1.5rem" }}>
                <div>
                  <label className="text-[13px] text-[#1E1B16] font-medium block" style={{ marginBottom: "0.75rem" }}>
                    닉네임
                  </label>
                  <input type="text" value={nickname} readOnly className="w-full h-[46px] rounded-md border border-[#E8E3D9] bg-[#FAF9F6] px-3 text-sm text-[#1E1B16] focus:outline-none cursor-not-allowed" />
                </div>

                <div>
                  <label className="text-[13px] text-[#1E1B16] font-medium block" style={{ marginBottom: "0.75rem" }}>
                    이메일
                  </label>
                  <input type="email" value={email} readOnly className="w-full h-[46px] rounded-md border border-[#E8E3D9] bg-[#FAF9F6] px-3 text-sm text-[#1E1B16] focus:outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 카드 */}
          <div className="flex-[0.8] bg-[#FFFFFF] border border-[#E8E3D9] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-start" style={{ padding: "3.5rem", minHeight: "520px" }}>
            <div>
              <h2 className="text-[15px] font-bold text-[#1E1B16]" style={{ marginBottom: "0.75rem" }}>
                내 작업 바로가기
              </h2>
              <p className="text-[#6A6558] text-[13px]" style={{ marginBottom: "2.5rem" }}>
                주요 활동과 자료를 한눈에 확인하세요
              </p>

              <div className="flex flex-col" style={{ gap: "1.5rem" }}>
                {/* 내 프로젝트 */}
                <div
                  className="flex items-start gap-4 border border-[#E8E3D9] rounded-[10px] hover:bg-[#FBFAF7] transition cursor-pointer"
                  style={{ padding: "1.5rem" }}
                  onClick={handleProjectClick}
                >
                  <div className="w-10 h-10 bg-[#2B7FFF] rounded-lg flex items-center justify-center flex-shrink-0" style={{ marginTop: "8px", marginRight: "0.5rem" }}>
                    <Image src="/project.png" alt="project icon" width={25} height={25} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="text-[#1E1B16] font-semibold text-[13px]" style={{ marginBottom: "0.5rem" }}>
                      내 프로젝트
                    </h3>
                    <p className="text-[#6A6558] text-[12px] leading-snug">
                      진행 중인 프로젝트와 완료된 프로젝트를 확인하세요
                    </p>
                  </div>
                  <span className="text-[#8B8577] text-lg">→</span>
                </div>

                {/* 포트폴리오 */}
                <div
                  className="flex items-start gap-4 border border-[#E8E3D9] rounded-[10px] hover:bg-[#FBFAF7] transition cursor-pointer"
                  style={{ padding: "1.5rem" }}
                  onClick={handlePortfolioClick}
                >
                  <div className="w-10 h-10 bg-[#00C950] rounded-lg flex items-center justify-center flex-shrink-0" style={{ marginTop: "8px", marginRight: "0.5rem" }}>
                    <Image src="/portfolio.png" alt="portfolio icon" width={25} height={25} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="text-[#1E1B16] font-semibold text-[13px]" style={{ marginBottom: "0.5rem" }}>
                      내 프리랜서 정보
                    </h3>
                    <p className="text-[#6A6558] text-[12px] leading-snug">
                      나의 작업물과 경력을 관리하고 업데이트하세요
                    </p>
                  </div>
                  <span className="text-[#8B8577] text-lg">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

 {/* 권한 없을 때 모달 */}
{modalType && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">
    <div
      style={{
        backgroundColor: "white",
        position: "relative",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        width: "380px",
        textAlign: "center",
      }}
    >
      {/* 닫기 X 버튼 */}
      <button
        onClick={() => setModalType(null)}
        style={{
          position: "absolute",
          top: "10px",
          right: "14px",
          background: "none",
          border: "none",
          color: "#6b6b6b",
          fontSize: "22px",
          fontWeight: "bold",
          lineHeight: "1",
          cursor: "pointer",
        }}
        aria-label="닫기"
      >
        ×
      </button>

      <p className="text-[18px] text-gray-900 mb-4 mt-2">
  {modalType === "project" ? "아직 프로젝트가 없어요" : "아직 포트폴리오가 없어요"}
      </p>

       <button
        onClick={handleModalCreate}
        style={{
          background: "none",
          border: "none",
          color: "#16a34a",
          fontSize: "15px",
          cursor: "pointer",
          textDecoration: "underline",
          padding: "8px 0",
        }}
      >
        생성하러 가기
      </button>
    </div>
  </div>
)}

    </div>
  );
}
