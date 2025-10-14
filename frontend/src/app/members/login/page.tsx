"use client";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";
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
          credentials: "include",
          body: JSON.stringify({ username: usernameInput, password }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.msg || "로그인 실패");
        return;
      }

      setSuccessMsg(data.msg || "로그인 성공");

      // 새로고침 시 유지
      const usernameFromDto = data.Data?.username ?? null;
      setUsername(usernameFromDto);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setErrorMsg("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-center items-start pt-[100px]"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="w-[448px] flex flex-col items-center">
        <h1 className="text-[24px] font-bold leading-[32px] mb-2 text-[#0F0A03]">
          로그인
        </h1>
        <p className="text-[14px] font-[300] leading-[20px] mb-[20px] text-[#5A5549]">
          FIT에 로그인하여 서비스를 이용하세요
        </p>

        <div
          className="w-full bg-[#FDFCF8] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-[16px]"
          style={{ padding: "35px" }}
        >
          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* 아이디 */}
            <div className="flex flex-col mb-[20px] relative">
              <label className="text-[14px] font-medium mb-[8px] text-[#0F0A03]">
                아이디
              </label>
              <div className="relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ paddingLeft: "8px" }}
                >
                  <Image
                    src="/id.png"
                    alt="아이디 아이콘"
                    width={16}
                    height={16}
                  />
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  className="w-full h-[36px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] placeholder:font-[350]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.002)",
                    border: "1px solid #F5EEE0",
                    color: "#0F0A03",
                    paddingLeft: "35px",
                    paddingRight: "35px",
                  }}
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col mb-[20px] relative">
              <label className="text-[14px] font-medium mb-[8px] text-[#0F0A03]">
                비밀번호
              </label>
              <div className="relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ paddingLeft: "8px" }}
                >
                  <Image
                    src="/password.png"
                    alt="비밀번호 아이콘"
                    width={16}
                    height={16}
                  />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full h-[36px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] placeholder:font-[350]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.002)",
                    border: "1px solid #F5EEE0",
                    color: "#0F0A03",
                    paddingLeft: "35px",
                    paddingRight: "35px",
                  }}
                />
              </div>
              <p className="text-[14px] font-[300] leading-[20px] text-right text-[#5A5549]">
                <span
                  className="cursor-pointer hover:underline font-normal text-[#006A20]"
                  onClick={() => router.push("/members/findid")}
                >
                  아이디 찾기
                </span>
                {" / "}
                <span
                  className="cursor-pointer hover:underline font-normal text-[#006A20]"
                  onClick={() => router.push("/members/updatePassword")}
                >
                  비밀번호 재설정
                </span>
              </p>
            </div>

            {/* 에러 / 성공 메시지 */}
            {(errorMsg || successMsg) && (
              <p
                className={`text-[14px] text-center mb-4 ${
                  errorMsg ? "text-red-500" : "text-green-500"
                }`}
              >
                {errorMsg || successMsg}
              </p>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="w-full h-[36px] bg-[#006A20] text-[#FBF8F1] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px] font-medium leading-[20px] cursor-pointer hover:bg-[#005a1a] transition-colors mb-[15px]"
            >
              로그인
            </button>

            {/* 회원가입 링크 */}
            <p className="text-[14px] font-[300] leading-[20px] text-center text-[#5A5549] mb-2">
              아직 FIT 회원이 아니라면?{" "}
              <span
                className="cursor-pointer hover:underline font-normal text-[#006A20]"
                onClick={() => router.push("/members/signup")}
              >
                회원가입
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
