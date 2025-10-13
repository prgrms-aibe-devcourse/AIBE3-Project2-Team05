"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import "./Header.css";

export const Header = () => {
  const router = useRouter();
  const { username, setUsername } = useUser();
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 렌더링 준비 후 상태 설정
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 클라이언트 전에는 렌더 X → Hydration mismatch 완전 차단
  if (!isClient) return null;

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/member/logout`, {
        method: "DELETE",
        credentials: "include",
      });
      setUsername(null);
      router.push("/");
    } catch (err) {
      console.error("로그아웃 중 오류 발생:", err);
    }
  };

  const navigationItems = [
    { text: "프로젝트", path: "/projects", left: "41.4%", width: "54.28px" },
    {
      text: "포트폴리오 검색",
      path: "/freelancers",
      left: "46.6%",
      width: "98.17px",
    },
    { text: "이용후기", path: "/reviews", left: "54.1%", width: "54.28px" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full h-[68px] bg-white z-50">
      {/* 로고 */}
      <img
        src="/logo-text.png"
        alt="Logo"
        className="absolute left-[13.2%] top-[14px] w-[174px] h-[44px] object-cover cursor-pointer"
        onClick={() => router.push("/")}
      />

      {/* 내비게이션 */}
      {navigationItems.map((item, index) => (
        <a
          key={index}
          href={item.path}
          className="absolute text-[#424953] text-[14.6px] leading-[27px] flex items-center cursor-pointer hover:text-[#006A20] transition-colors"
          style={{
            left: item.left,
            width: item.width,
            height: "21px",
            top: "calc(50% - 21px/2 + 0.5px)",
          }}
        >
          {item.text}
        </a>
      ))}

      {/* 로그인/로그아웃 영역 */}
      <div className="absolute right-[28%] top-[calc(50%-24px/2+1px)] flex items-center gap-x-[24px]">
        {username ? (
          <>
            <div className="flex items-center">
              <span className="text-[#666] text-[13.1px] leading-[24px] whitespace-nowrap">
                {username}님
              </span>
              <span className="mx-2 text-[#666] text-[14px] leading-[21px] font-normal">
                |
              </span>
              <a
                href="/members/mypage"
                className="text-[#666] text-[13.1px] leading-[24px] hover:text-[#006A20] transition-colors whitespace-nowrap"
              >
                마이페이지
              </a>
            </div>
            <span
              onClick={handleLogout}
              className="text-[#666] text-[13.1px] leading-[24px] cursor-pointer hover:text-[#006A20] transition-colors whitespace-nowrap"
            >
              로그아웃
            </span>
          </>
        ) : (
          <>
            <a
              href="/members/login"
              className="text-[#666] text-[13.1px] leading-[24px] hover:text-[#006A20] transition-colors whitespace-nowrap"
            >
              로그인
            </a>
            <span className="mx-2 text-[#666] text-[14px] leading-[21px] font-normal">
              |
            </span>
            <a
              href="/members/signup"
              className="text-[#666] text-[13.1px] leading-[24px] hover:text-[#006A20] transition-colors whitespace-nowrap"
            >
              회원가입
            </a>
          </>
        )}
      </div>
    </header>
  );
};
