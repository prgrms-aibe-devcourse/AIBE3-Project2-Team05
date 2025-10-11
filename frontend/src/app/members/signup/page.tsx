"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username || !name || !email || !password || !passwordConfirm) {
      setErrorMsg("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!agreed) {
      setErrorMsg("이용약관 및 개인정보처리방침에 동의해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, name, email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.msg || "회원가입 실패");
        return;
      }

      setSuccessMsg(data.msg || "회원가입 성공");
      setTimeout(() => router.push("/members/login"), 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-68px)] bg-[linear-gradient(0deg,#FBF8F1,#FBF8F1),#FFFFFF] flex justify-center items-center py-12">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(241,234,220,0.3)] pointer-events-none"></div>

      {/* 중앙 컨테이너 */}
      <div className="relative z-10 w-[448px] flex flex-col items-center">
        {/* 헤더 텍스트 */}
        <h1 className="text-[24px] font-bold text-[#0F0A03] leading-[32px] mb-2">
          회원가입
        </h1>
        <p className="text-[14px] font-light text-[#5A5549] leading-[20px] mb-[20px]">
          FIT에 가입하여 새로운 기회를 만나보세요
        </p>

        {/* Form Background */}
        <div className="w-full bg-[#FDFCF8] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-[16px] px-6 py-6">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* 아이디 */}
            <div className="flex flex-col mb-[20px]">
              <label className="text-[14px] font-medium text-[#0F0A03] leading-[14px] mb-[8px]">
                아이디
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z"
                    fill="#5A5549"
                  />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  className="w-full h-[36px] pl-[41px] pr-3 rounded-[10px] border border-[#F5EEE0] bg-[rgba(255,255,255,0.002)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] text-[#0F0A03] placeholder:text-[#5A5549]"
                />
              </div>
            </div>

            {/* 이메일 */}
            <div className="flex flex-col mb-[20px]">
              <label className="text-[14px] font-medium text-[#0F0A03] leading-[14px] mb-[8px]">
                이메일
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M14 2H2C0.9 2 0 2.9 0 4V12C0 13.1 0.9 14 2 14H14C15.1 14 16 13.1 16 12V4C16 2.9 15.1 2 14 2ZM14 4L8 8L2 4H14ZM14 12H2V6L8 10L14 6V12Z"
                    fill="#5A5549"
                  />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="w-full h-[36px] pl-[41px] pr-3 rounded-[10px] border border-[#F5EEE0] bg-[rgba(255,255,255,0.002)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] text-[#0F0A03] placeholder:text-[#5A5549]"
                />
              </div>
            </div>

            {/* 이름 */}
            <div className="flex flex-col mb-[20px]">
              <label className="text-[14px] font-medium text-[#0F0A03] leading-[14px] mb-[8px]">
                이름
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z"
                    fill="#5A5549"
                  />
                </svg>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full h-[36px] pl-[41px] pr-3 rounded-[10px] border border-[#F5EEE0] bg-[rgba(255,255,255,0.002)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] text-[#0F0A03] placeholder:text-[#5A5549]"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col mb-[20px]">
              <label className="text-[14px] font-medium text-[#0F0A03] leading-[14px] mb-[8px]">
                비밀번호
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M12 6V4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4V6C2.9 6 2 6.9 2 8V14C2 15.1 2.9 16 4 16H12C13.1 16 14 15.1 14 14V8C14 6.9 13.1 6 12 6ZM8 12C6.9 12 6 11.1 6 10C6 8.9 6.9 8 8 8C9.1 8 10 8.9 10 10C10 11.1 9.1 12 8 12ZM10 6H6V4C6 2.9 6.9 2 8 2C9.1 2 10 2.9 10 4V6Z"
                    fill="#5A5549"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full h-[36px] pl-[41px] pr-10 rounded-[10px] border border-[#F5EEE0] bg-[rgba(255,255,255,0.002)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] text-[#0F0A03] placeholder:text-[#5A5549]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3C4.5 3 1.73 5.61 1 9C1.73 12.39 4.5 15 8 15C11.5 15 14.27 12.39 15 9C14.27 5.61 11.5 3 8 3ZM8 13C6.34 13 5 11.66 5 10C5 8.34 6.34 7 8 7C9.66 7 11 8.34 11 10C11 11.66 9.66 13 8 13ZM8 8.5C7.17 8.5 6.5 9.17 6.5 10C6.5 10.83 7.17 11.5 8 11.5C8.83 11.5 9.5 10.83 9.5 10C9.5 9.17 8.83 8.5 8 8.5Z"
                      fill="#0F0A03"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col mb-[20px]">
              <label className="text-[14px] font-medium text-[#0F0A03] leading-[14px] mb-[8px]">
                비밀번호 확인
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M12 6V4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4V6C2.9 6 2 6.9 2 8V14C2 15.1 2.9 16 4 16H12C13.1 16 14 15.1 14 14V8C14 6.9 13.1 6 12 6ZM8 12C6.9 12 6 11.1 6 10C6 8.9 6.9 8 8 8C9.1 8 10 8.9 10 10C10 11.1 9.1 12 8 12ZM10 6H6V4C6 2.9 6.9 2 8 2C9.1 2 10 2.9 10 4V6Z"
                    fill="#5A5549"
                  />
                </svg>
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full h-[36px] pl-[41px] pr-10 rounded-[10px] border border-[#F5EEE0] bg-[rgba(255,255,255,0.002)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] text-[#0F0A03] placeholder:text-[#5A5549]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3C4.5 3 1.73 5.61 1 9C1.73 12.39 4.5 15 8 15C11.5 15 14.27 12.39 15 9C14.27 5.61 11.5 3 8 3ZM8 13C6.34 13 5 11.66 5 10C5 8.34 6.34 7 8 7C9.66 7 11 8.34 11 10C11 11.66 9.66 13 8 13ZM8 8.5C7.17 8.5 6.5 9.17 6.5 10C6.5 10.83 7.17 11.5 8 11.5C8.83 11.5 9.5 10.83 9.5 10C9.5 9.17 8.83 8.5 8 8.5Z"
                      fill="#0F0A03"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="flex items-center gap-[7px] mb-[15px]">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-[13px] h-[13px] rounded-[2.5px] border border-[#767676] bg-white cursor-pointer"
              />
              <label
                htmlFor="agree"
                className="text-[14px] font-medium text-[#006A20] leading-[23px] cursor-pointer"
              >
                이용약관 및 개인정보처리방침에 동의합니다.
              </label>
            </div>

            {errorMsg && (
              <p className="text-[14px] text-red-500 text-center mb-4">
                {errorMsg}
              </p>
            )}
            {successMsg && (
              <p className="text-[14px] text-green-500 text-center mb-4">
                {successMsg}
              </p>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="w-full h-[36px] bg-[#006A20] text-[#FBF8F1] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px] font-medium leading-[20px] cursor-pointer hover:bg-[#005a1a] transition-colors mb-[10px]"
            >
              회원가입
            </button>

            {/* 로그인 링크 */}
            <p className="text-[14px] font-light text-[#5A5549] leading-[20px] text-center">
              이미 계정이 있으신가요?{" "}
              <span
                className="text-[#006A20] cursor-pointer hover:underline"
                onClick={() => router.push("/members/login")}
              >
                로그인
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
