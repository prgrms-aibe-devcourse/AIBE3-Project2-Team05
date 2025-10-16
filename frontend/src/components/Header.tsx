"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useUser } from "@/app/context/UserContext";
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
      const text = await res.text();
      if (text) {
        try {
          JSON.parse(text);
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
    { text: "프로젝트", path: "/projects" },
    { text: "프리랜서", path: "/freelancers" },
    { text: "매칭 서비스", path: "/matching" },
    { text: "이용후기", path: "/reviewlist" },
  ];

  return (
    <header className="header-text">
      {/* 로고 */}
      <Image
        src="/logo-text.png"
        alt="Logo"
        width={300}
        height={70}
        className="w-[210px] lg:w-[300px] h-[49px] lg:h-[70px] object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={() => router.push("/")}
        priority
      />
      
      {/* 네비게이션 */}
      <nav className="navigation-items">
        {navigationItems.map((item, index) => (
          <a
            key={index}
            href={item.path}
            className="navigation-text text-[#424953] hover:text-[#006A20] transition-colors whitespace-nowrap"
          >
            {item.text}
          </a>
        ))}
      </nav>

      {/* 로그인/회원가입 영역 */}
      <div className="login-logout-area flex items-center gap-x-4 lg:gap-x-8">
        {username ? (
          <>
            <div className="flex items-center">
              <span className="text-[#666] text-[14px] md:text-[16px] lg:text-[18px] leading-[26px] whitespace-nowrap">
                {username}님
              </span>
              <span className="mx-2 lg:mx-3 text-[#666] text-[14px] lg:text-[18px] leading-[22px] font-normal">
                |
              </span>
              <a
                href="/members/mypage"
                className="text-[#666] text-[14px] md:text-[16px] lg:text-[18px] leading-[26px] hover:text-[#006A20] transition-colors whitespace-nowrap"
              >
                마이페이지
              </a>
            </div>
            <span
              onClick={handleLogout}
              className="text-[#666] text-[14px] md:text-[16px] lg:text-[18px] leading-[26px] cursor-pointer hover:text-[#006A20] transition-colors whitespace-nowrap"
            >
              로그아웃
            </span>
          </>
        ) : (
          <>
            <a
              href="/members/login"
              className="text-[#666] text-[14px] md:text-[16px] lg:text-[18px] leading-[26px] hover:text-[#006A20] transition-colors whitespace-nowrap"
            >
              로그인
            </a>
            <span className="mx-2 lg:mx-3 text-[#666] text-[14px] lg:text-[18px] leading-[22px] font-normal">
              |
            </span>
            <a
              href="/members/signup"
              className="text-[#666] text-[14px] md:text-[16px] lg:text-[18px] leading-[26px] hover:text-[#006A20] transition-colors whitespace-nowrap"
            >
              회원가입
            </a>
          </>
        )}
      </div>
    </header>
  );
};
