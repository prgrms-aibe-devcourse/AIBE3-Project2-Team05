"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// app/sign-up/page.tsx
export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!agree) {
      setErrorMsg("약관에 동의해주세요.");
      return;
    }

    if (password !== passwordCheck) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            nickname,
            password,
            passwordCheck,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text || "회원가입에 실패했습니다." };
        }
        setErrorMsg(data.message);
        return;
      }

      // 회원가입 성공
      setSuccessMsg("회원가입이 완료되었습니다!");
      // 필요하면 입력 초기화
      setUsername("");
      setEmail("");
      setNickname("");
      setPassword("");
      setPasswordCheck("");
      setAgree(false);
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      setErrorMsg("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="relative w-screen h-screen bg-[var(--background)] flex justify-center items-center overflow-y-auto">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(241,234,220,0.3)] z-0"></div>

      {/* 중앙 컨테이너 */}
      <div className="relative z-10 w-[448px] h-[740.75px] flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center mt-4">
          <h1 className="text-[30px] font-bold text-[var(--primary)]">FIT</h1>
          <p className="text-[16px] font-normal text-[var(--muted-foreground)] mt-2">
            Freelancer In Talent
          </p>
        </div>

        {/* Form Background */}
        <div className="mt-6 w-full bg-[#FDFCF8] shadow-lg rounded-[16px] flex-1 p-6">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* 이름 */}
            <div className="flex flex-col">
              <label className="text-[14px] font-medium text-[var(--foreground)]">
                이름
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="이름을 입력하세요"
                className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* 이메일 */}
            <div className="flex flex-col">
              <label className="text-[14px] font-medium text-[var(--foreground)]">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* 닉네임 */}
            <div className="flex flex-col">
              <label className="text-[14px] font-medium text-[var(--foreground)]">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* 비밀번호 */}
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

            {/* 비밀번호 확인 */}
            <div className="flex flex-col">
              <label className="text-[14px] font-medium text-[var(--foreground)]">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* 약관 체크 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 border border-gray-400 rounded"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span className="text-[14px] font-medium text-[var(--primary)]">
                이용약관 및 개인정보처리방침에 동의합니다.
              </span>
            </div>

            {errorMsg && <p className="text-red-500">{errorMsg}</p>}
            {successMsg && <p className="text-green-500">{successMsg}</p>}

            {/* 가입 버튼 */}
            <button
              type="submit"
              className="w-full h-[36px] bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[10px] cursor-pointer"
            >
              회원가입
            </button>

            {/* 로그인 링크 */}
            <p className="text-[14px] font-light text-[var(--muted-foreground)] text-center cursor-pointer">
              이미 계정이 있으신가요?{" "}
              <span className="text-[var(--primary)]">로그인</span>
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
