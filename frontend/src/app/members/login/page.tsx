"use client";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { setUsername } = useUser();

  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!usernameInput || !password) {
      setErrorMsg("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 쿠키 저장
          body: JSON.stringify({ username: usernameInput, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.msg || "로그인 실패");
        return;
      }

      setSuccessMsg(data.msg || "로그인 성공");

      // DTO에서 닉네임 가져와 Context에 저장
      const usernameFromDto = data.Data?.MemberDto?.nickname ?? null;
      setUsername(usernameFromDto);

      router.push("/"); // 메인 페이지 이동
    } catch (err) {
      console.error(err);
      setErrorMsg("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="relative w-screen h-screen bg-[var(--background)] flex justify-center items-center overflow-y-auto">
      <div className="absolute inset-0 bg-[rgba(241,234,220,0.3)] z-0"></div>
      <div className="relative z-10 w-[448px] h-[400px] flex flex-col items-center">
        <div className="flex flex-col items-center mt-4">
          <h1 className="text-[30px] font-bold text-[var(--primary)]">FIT</h1>
          <p className="text-[16px] font-normal text-[var(--muted-foreground)] mt-2">
            로그인
          </p>
        </div>
        <div className="mt-6 w-full bg-[#FDFCF8] shadow-lg rounded-[16px] flex-1 p-6">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="text-[14px] font-medium text-[var(--foreground)]">
                아이디
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[14px] font-medium text-[var(--foreground)]">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {errorMsg && <p className="text-red-500">{errorMsg}</p>}
            {successMsg && <p className="text-green-500">{successMsg}</p>}

            <button
              type="submit"
              className="w-full h-[36px] bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[10px] cursor-pointer"
            >
              로그인
            </button>

            <p className="text-[14px] font-light text-[var(--muted-foreground)] text-center cursor-pointer">
              계정이 없으신가요?{" "}
              <span
                className="text-[var(--primary)]"
                onClick={() => router.push("/members/signup")}
              >
                회원가입
              </span>
            </p>

            <p className="text-[14px] font-light text-[var(--muted-foreground)] text-center mt-1">
              <span
                className="text-[var(--primary)] cursor-pointer"
                onClick={() => router.push("/members/findid")}
              >
                아이디 찾기
              </span>
              {" / "}
              <span
                className="text-[var(--primary)] cursor-pointer"
                onClick={() => router.push("/members/updatePassword")}
              >
                비밀번호 재설정
              </span>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
