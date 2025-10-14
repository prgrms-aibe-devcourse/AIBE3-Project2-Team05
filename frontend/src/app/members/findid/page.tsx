"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FindId() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState(""); // 모달 메시지
  const [codeSent, setCodeSent] = useState(false);

  const sendCode = async () => {
    setErrorMsg("");
    setInfoMsg("");
    if (!email) {
      setErrorMsg("이메일을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/findId/sendCode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.msg || "인증 코드 발송 실패");
        return;
      }

      setCodeSent(true);
      setInfoMsg("인증 코드가 이메일로 발송되었습니다.");
    } catch (err) {
      console.error(err);
      setErrorMsg("인증 코드 발송 중 오류 발생");
    }
  };

  const verifyId = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!verifyCode) {
      setErrorMsg("인증 코드를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/findId/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, verifyCode }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.msg || "아이디 찾기 실패");
        return;
      }

      // 서버가 msg 안에 아이디 문구를 포함해서 보냄
      setInfoMsg(data.msg);
    } catch (err) {
      console.error(err);
      setErrorMsg("아이디 찾기 중 오류 발생");
    }
  };
  return (
    <main className="relative w-screen h-screen bg-[var(--background)] flex justify-center items-center overflow-y-auto">
      <div className="absolute inset-0 bg-[rgba(241,234,220,0.3)] z-0"></div>

      <div className="relative z-10 w-[480px] flex flex-col items-center">
        {/* 제목 및 설명 */}
        <div className="w-full flex flex-col items-center mb-6">
          <h1
            className="text-[24px] font-bold leading-[32px] mb-3"
            style={{ color: "#0F0A03" }}
          >
            아이디 찾기
          </h1>
          <p
            className="text-[14px] font-[300] leading-[20px]"
            style={{ color: "#5A5549" }}
          >
            등록 된 이메일로 인증번호를 발송해드려요
          </p>
        </div>

        {/* 카드 본문 */}
        <div
          className="w-full bg-[#FDFCF8] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded-[16px]"
          style={{ padding: "35px 35px" }}
        >
          <div className="flex flex-col gap-4">
            {/* 이메일 입력 */}
            <div className="flex flex-col gap-2 mb-5">
              <label
                className="text-[14px] font-medium leading-[14px]"
                style={{ color: "#0F0A03", marginBottom: "10px" }}
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
                  className="w-full h-[40px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] placeholder:font-[350]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.002)",
                    border: `1px solid #F5EEE0`,
                    color: "#0F0A03",
                    paddingLeft: "35px",
                    paddingRight: "12px",
                  }}
                />
              </div>
            </div>

            {/* 비밀번호 재설정 */}
            <div className="flex justify-end mt-[10px] mb-[20px]">
              <span
                className="text-[14px] font-normal cursor-pointer hover:underline"
                style={{ color: "#006A20" }}
                onClick={() => router.push("/members/updatePassword")}
              >
                비밀번호 재설정
              </span>
            </div>

            {/* 아이디 찾기 버튼 */}
            <button
              type="button"
              onClick={sendCode}
              className="w-full h-[40px] bg-[#006A20] text-[#FBF8F1] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px] font-medium leading-[20px] cursor-pointer hover:bg-[#005a1a] transition-colors"
            >
              아이디 찾기
            </button>

            {/* 인증 코드 입력 */}
            {codeSent && (
              <div className="flex flex-col gap-2">
                <label
                  className="text-[14px] font-medium leading-[14px]"
                  style={{
                    color: "#0F0A03",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  인증 코드
                </label>
                <div className="relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ paddingLeft: "8px" }}
                  >
                    <Image
                      src="/email.png"
                      alt="인증 코드 아이콘"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </div>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="인증 코드를 입력하세요"
                    className="w-full h-[40px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px] font-[350] placeholder:font-[350]"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.002)",
                      border: `1px solid #F5EEE0`,
                      color: "#0F0A03",
                      paddingLeft: "35px",
                      paddingRight: "12px",
                    }}
                  />
                </div>
                <br />

                <button
                  type="button"
                  onClick={verifyId}
                  className="w-full h-[40px] bg-[#006A20] text-[#FBF8F1] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px] font-medium leading-[20px] cursor-pointer hover:bg-[#005a1a] transition-colors"
                >
                  아이디 확인
                </button>
              </div>
            )}
            {infoMsg && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                <div
                  style={{
                    backgroundColor: "white",
                    position: "relative",
                    padding: "24px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    width: "380px",
                    textAlign: "center",
                  }}
                >
                  <p className="mb-6 text-[16px] font-medium text-gray-800">
                    {infoMsg}
                  </p>
                  <button
                    onClick={() => setInfoMsg("")}
                    className="px-5 py-2 bg-[#006A20] rounded-md hover:bg-[#005a1a] transition"
                    style={{ color: "#ffffff" }}
                  >
                    확인
                  </button>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {errorMsg && (
              <p className="text-[14px] text-red-500 text-center">{errorMsg}</p>
            )}

            {/* 회원가입 링크 */}
            <p
              className="text-[14px] font-[300] leading-[20px] text-center mt-4"
              style={{ color: "#5A5549", marginTop: "10px" }}
            >
              아직 FIT 회원이 아니라면?{" "}
              <span
                className="cursor-pointer hover:underline font-normal"
                style={{ color: "#006A20" }}
                onClick={() => router.push("/members/signup")}
              >
                회원가입
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}