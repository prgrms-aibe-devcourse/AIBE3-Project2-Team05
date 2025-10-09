"use client";
import { useEffect, useState } from "react";

export default function MyPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setMsg(data.msg || "정보를 불러오지 못했습니다.");
          return;
        }

        const member = data.Data;
        if (member) {
          setNickname(member.nickname ?? "");
          setEmail(member.email ?? "");
        } else {
          setMsg("회원 정보를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error(err);
        setMsg("정보 불러오기 중 오류 발생");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  if (loading) return <p className="text-center mt-10">로딩 중...</p>;

  return (
    <main className="relative min-h-screen bg-[#FBF8F1] pt-8 pb-20 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* 제목 */}
        <h1 className="text-[30px] font-bold text-[#0f0a03] mb-2">
          마이페이지
        </h1>
        <p className="text-base text-[#5A5549] mb-8">
          프로필 정보와 활동 현황을 관리하세요
        </p>

        {/* 상단: 프로필 + 내 작업 바로가기 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 프로필 카드 */}
          <div className="bg-[#FDFCF8] border border-[#DDD7C9] rounded-2xl p-6 relative shadow-sm">
            {msg && <p className="text-red-500 text-sm mb-4">{msg}</p>}

            {/* 편집 버튼 */}
            <button className="absolute top-6 right-6 h-9 px-4 bg-[#006A20] text-white rounded-lg text-sm font-medium cursor-not-allowed opacity-50">
              편집
            </button>

            <div className="flex flex-col gap-5 mt-8">
              {/* 닉네임 */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#0f0a03] mb-2">
                  닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  readOnly
                  className="h-11 rounded-lg border border-[#DDD7C9] bg-[#FDFCF8] px-4 text-[#0f0a03] cursor-not-allowed text-sm"
                />
              </div>

              {/* 이메일 */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#0f0a03] mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="h-11 rounded-lg border border-[#DDD7C9] bg-[#FDFCF8] px-4 text-[#0f0a03] cursor-not-allowed text-sm"
                />
              </div>
            </div>
          </div>

          {/* 내 작업 바로가기 */}
          <div className="bg-[#FDFCF8] border border-[#DDD7C9] rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-[#0f0a03] text-xl mb-2">
              내 작업 바로가기
            </h2>
            <p className="text-[#5A5549] text-sm mb-6">
              주요 활동과 자료를 한눈에 확인하세요
            </p>

            <div className="flex flex-col gap-3">
              <div className="bg-[#2b7fff] text-white rounded-xl p-4 cursor-pointer hover:bg-[#1a5fd1] transition-colors">
                <span className="font-medium">내 프로젝트</span>
              </div>
              <div className="bg-[#F5EEE0] text-[#0f0a03] rounded-xl p-4 cursor-pointer hover:bg-[#E8E1D3] transition-colors">
                <span className="font-medium">포트폴리오</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 프로젝트 목록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#0f0a03] mb-4">내 프로젝트</h3>

          {/* 프로젝트 카드 1 */}
          <div className="bg-[#FDFCF8] border border-[#DDD7C9] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2b7fff] flex items-center justify-center flex-shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#0f0a03] text-base mb-1">
                  이메일 인증 화면 개발
                </h4>
                <p className="text-[#5A5549] text-sm mb-3">
                  프로젝트 설명과 진행 현황을 관리하세요
                </p>
                <div className="flex items-center gap-2 text-xs text-[#5A5549]">
                  <span>진행중</span>
                  <span>•</span>
                  <span>2024.10.09 ~ 2024.12.31</span>
                </div>
              </div>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="#5A5549"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* 프로젝트 카드 2 */}
          <div className="bg-[#FDFCF8] border border-[#DDD7C9] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00C950] flex items-center justify-center flex-shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#0f0a03] text-base mb-1">
                  회원가입 화면 완료
                </h4>
                <p className="text-[#5A5549] text-sm mb-3">
                  프로젝트 설명과 진행 현황을 관리하세요
                </p>
                <div className="flex items-center gap-2 text-xs text-[#5A5549]">
                  <span>완료</span>
                  <span>•</span>
                  <span>2024.09.01 ~ 2024.09.30</span>
                </div>
              </div>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="#5A5549"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
