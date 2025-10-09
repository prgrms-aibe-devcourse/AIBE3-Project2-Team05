"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export function Header() {
  const router = useRouter();
  const { username, setUsername } = useUser();

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/member/logout`, {
        method: "DELETE",
        credentials: "include",
      });
      setUsername(null); // Context 초기화
      router.push("/");
    } catch (err) {
      console.error("로그아웃 중 오류 발생:", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-[65px] bg-[#fbf8f1cc] border-b border-[#ddd6c9] flex items-center px-8 z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-[#006a20]">FIT</h1>
        <p className="text-sm text-[#5a5448]">Freelancer In Talent</p>
      </div>

      <div className="flex items-center gap-6 ml-auto">
        <button onClick={() => router.push("/projects")}>프로젝트</button>
        <button onClick={() => router.push("/freelancers")}>
          프리랜서 검색
        </button>
        <button onClick={() => router.push("/reviews")}>이용 후기</button>
        <button onClick={() => router.push("/members/mypage")}>
          마이페이지
        </button>

        {username ? (
          <>
            <span>{username}님</span>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button
              className="px-3 py-1 border rounded bg-[#fbf8f1]"
              onClick={() => router.push("/members/login")}
            >
              로그인
            </button>
            <button
              className="px-3 py-1 bg-[#006a20] text-white rounded"
              onClick={() => router.push("/members/signup")}
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
