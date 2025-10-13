"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import "./Header.css";

export const Header = () => {
  const router = useRouter();
  const { username, setUsername, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isLoaded) return null;

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/logout`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      // 서버가 빈 응답일 수도 있으니 JSON 파싱은 선택적으로
      let data = null;
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          console.log("JSON 파싱 실패, 빈 응답일 수 있음");
        }
      }

      setUsername(null);
      window.location.href = "/"; // SPA 새로고침 없이 로그인 상태 초기화
    } catch (err) {
      console.error("로그아웃 중 오류 발생:", err);
    }
  };

  const navigationItems = [
    { text: "프로젝트", path: "/projects", left: "35%", width: "54.28px" },
    {
      text: "프로젝트 생성",
      path: "/projects/create",
      left: "42%",
      width: "98.17px",
    },
    {
      text: "포트폴리오 검색",
      path: "/freelancers",
      left: "50%",
      width: "98.17px",
    },
    { text: "이용후기", path: "/reviews", left: "58%", width: "54.28px" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full h-[68px] bg-white z-50">
      <img
        src="/logo-text.png"
        alt="Logo"
        className="absolute left-[13.2%] top-[14px] w-[174px] h-[44px] object-cover cursor-pointer"
        onClick={() => router.push("/")}
      />
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
