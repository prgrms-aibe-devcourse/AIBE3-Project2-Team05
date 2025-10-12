"use client";
import Image from "next/image";
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
    <div
      className="w-full h-screen flex justify-center items-center"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="w-[448px] flex flex-col items-center">
        <h1
          className="text-[24px] font-bold leading-[32px] mb-2"
          style={{ color: "#0F0A03" }}
        >
          회원가입
        </h1>
        <p
          className="text-[14px] font-[300] leading-[20px] mb-[20px]"
          style={{ color: "#5A5549" }}
        >
          FIT에 가입하여 새로운 기회를 만나보세요
        </p>

        <div
          className="w-full max-w-[448px] mx-auto bg-[#FDFCF8] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-[16px]"
          style={{
            paddingLeft: "35px",
            paddingRight: "35px",
            paddingTop: "24px",
            paddingBottom: "24px",
          }}
        >
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="flex flex-col mb-[20px]">
              <label
                className="text-[14px] font-medium leading-[14px] mb-[8px]"
                style={{ color: "#0F0A03" }}
              >
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
                    className="object-contain"
                  />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  className="w-full h-[36px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] placeholder:font-[350]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.002)",
                    border: `1px solid #F5EEE0`,
                    color: "#0F0A03",
                    paddingLeft: "35px",
                    paddingRight: "35px",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col mb-[20px]">
              <label
                className="text-[14px] font-medium leading-[14px] mb-[8px]"
                style={{ color: "#0F0A03" }}
              >
                이메일
              </label>
              <div className="relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ paddingLeft: "8px" }}
                >
                  <Image
                    src="/email.png"
                    alt="이메일 아이콘"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="w-full h-[36px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] placeholder:font-[350]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.002)",
                    border: `1px solid #F5EEE0`,
                    color: "#0F0A03",
                    paddingLeft: "35px",
                    paddingRight: "35px",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col mb-[20px]">
              <label
                className="text-[14px] font-medium leading-[14px] mb-[8px]"
                style={{ color: "#0F0A03" }}
              >
                이름
              </label>
              <div className="relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ paddingLeft: "8px" }}
                >
                  <Image
                    src="/id.png"
                    alt="이름 아이콘"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full h-[36px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] placeholder:font-[350]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.002)",
                    border: `1px solid #F5EEE0`,
                    color: "#0F0A03",
                    paddingLeft: "35px",
                    paddingRight: "35px",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col mb-[20px]">
              <label
                className="text-[14px] font-medium leading-[14px] mb-[8px]"
                style={{ color: "#0F0A03" }}
              >
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
                    className="object-contain"
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
                    border: `1px solid #F5EEE0`,
                    color: "#0F0A03",
                    paddingLeft: "35px",
                    paddingRight: "35px",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col mb-[20px]">
              <label
                className="text-[14px] font-medium leading-[14px] mb-[8px]"
                style={{ color: "#0F0A03" }}
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ paddingLeft: "8px" }}
                >
                  <Image
                    src="/password.png"
                    alt="비밀번호 확인 아이콘"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full h-[36px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] placeholder:font-[350]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.002)",
                    border: `1px solid #F5EEE0`,
                    color: "#0F0A03",
                    paddingLeft: "35px",
                    paddingRight: "35px",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-[7px] mb-[24px]">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-[13px] h-[13px] rounded-[2.5px] border border-[#767676] bg-white cursor-pointer accent-[#006A20] flex-shrink-0"
              />
              <label
                htmlFor="agree"
                className="text-[14px] font-medium leading-[23px] cursor-pointer"
                style={{ color: "#006A20" }}
              >
                이용약관 및 개인정보처리방침에 동의합니다.
              </label>
            </div>

            {(errorMsg || successMsg) && (
              <p
                className={`text-[14px] text-center mb-4 ${
                  errorMsg ? "text-red-500" : "text-green-500"
                }`}
              >
                {errorMsg || successMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-[36px] bg-[#006A20] text-[#FBF8F1] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px] font-medium leading-[20px] cursor-pointer hover:bg-[#005a1a] transition-colors mb-[15px]"
            >
              회원가입
            </button>

            <p
              className="text-[14px] font-[300] leading-[20px] text-center"
              style={{ color: "#5A5549" }}
            >
              이미 계정이 있으신가요?{" "}
              <span
                className="cursor-pointer hover:underline font-normal"
                style={{ color: "#006A20" }}
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
