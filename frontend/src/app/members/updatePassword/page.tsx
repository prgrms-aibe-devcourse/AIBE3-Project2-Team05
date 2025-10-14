"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UpdatePassword() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState(""); // 모달 메시지

  const sendCode = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!username || !email) {
      setErrorMsg("아이디와 이메일을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/updatePassword/sendCode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email }),
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

  const resetPassword = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!verifyCode || !newPassword || !newPasswordCheck) {
      setErrorMsg("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== newPasswordCheck) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/updatePassword/verify`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            verifyCode,
            newPassword,
            newPasswordCheck,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.msg || "비밀번호 재설정 실패");
        return;
      }

      setInfoMsg(data.msg || "비밀번호가 성공적으로 변경되었습니다.");
      setUsername("");
      setEmail("");
      setVerifyCode("");
      setNewPassword("");
      setNewPasswordCheck("");
      setCodeSent(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("비밀번호 재설정 중 오류 발생");
    }
  };

  return (
    <main className="relative w-screen h-screen bg-[var(--background)] flex justify-center items-center overflow-y-auto">
      <div className="absolute inset-0 bg-[rgba(241,234,220,0.3)] z-0"></div>

      <div className="relative z-10 w-[448px] flex flex-col items-center">
        <h1
          className="text-[24px] font-bold leading-[32px] mb-2"
          style={{ color: "#0F0A03" }}
        >
          비밀번호 재설정
        </h1>
        <p
          className="text-[14px] font-[300] leading-[20px] mb-[20px]"
          style={{ color: "#5A5549" }}
        >
          등록된 이메일로 인증번호를 발송해드려요
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
          {/* 아이디 */}
          <div className="flex flex-col mb-[20px]">
            <label
              className="text-[14px] font-medium mb-[8px]"
              style={{ color: "#0F0A03" }}
            >
              아이디
            </label>
            <div className="relative">
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pl-[8px]">
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
                className="w-full h-[36px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px]"
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

          {/* 이메일 */}
          <div className="flex flex-col mb-[20px]">
            <label
              className="text-[14px] font-medium mb-[8px]"
              style={{ color: "#0F0A03" }}
            >
              이메일
            </label>
            <div className="relative">
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pl-[8px]">
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
                className="w-full h-[36px] rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px]"
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

          {/* 인증 코드 발송 버튼 */}
          <button
            type="button"
            onClick={sendCode}
            className="w-full h-[36px] bg-[#006A20] text-[#FBF8F1] rounded-[10px] text-[14px] font-medium mb-[20px] cursor-pointer hover:bg-[#005a1a] transition-colors"
          >
            인증 코드 발송
          </button>

          {codeSent && (
            <>
              {/* 인증 코드 */}
              <div className="flex flex-col mb-[20px]">
                <label
                  className="text-[14px] font-medium mb-[8px]"
                  style={{ color: "#0F0A03" }}
                >
                  인증 코드
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="인증 코드를 입력하세요"
                  className="w-full h-[36px] rounded-[10px] border border-[#F5EEE0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.002)",
                    color: "#0F0A03",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                  }}
                />
              </div>

              {/* 새 비밀번호 */}
              <div className="flex flex-col mb-[20px]">
                <label
                  className="text-[14px] font-medium mb-[8px]"
                  style={{ color: "#0F0A03" }}
                >
                  새 비밀번호
                </label>
                <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pl-[8px]">
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    className="w-full h-[36px] rounded-[10px] border border-[#F5EEE0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px]"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.002)",
                      color: "#0F0A03",
                      paddingLeft: "35px",
                      paddingRight: "35px",
                    }}
                  />
                </div>
              </div>

              {/* 새 비밀번호 확인 */}
              <div className="flex flex-col mb-[20px]">
                <label
                  className="text-[14px] font-medium mb-[8px]"
                  style={{ color: "#0F0A03" }}
                >
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pl-[8px]">
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
                    value={newPasswordCheck}
                    onChange={(e) => setNewPasswordCheck(e.target.value)}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className="w-full h-[36px] rounded-[10px] border border-[#F5EEE0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[#006A20] text-[14px]"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.002)",
                      color: "#0F0A03",
                      paddingLeft: "35px",
                      paddingRight: "35px",
                    }}
                  />
                </div>
              </div>

              {/* 비밀번호 변경 버튼 */}
              <button
                type="button"
                onClick={resetPassword}
                className="w-full h-[36px] bg-[#006A20] text-[#FBF8F1] rounded-[10px] text-[14px] font-medium cursor-pointer hover:bg-[#005a1a] transition-colors"
              >
                비밀번호 변경
              </button>
            </>
          )}

          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="text-[14px] text-red-500 text-center mt-4">
              {errorMsg}
            </p>
          )}

          {/* 로그인 페이지 이동 */}
          <p
            className="text-[14px] font-[300] leading-[20px] text-center mt-4"
            style={{ color: "#5A5549" }}
          >
            이미 FIT 회원이라면?{" "}
            <span
              className="cursor-pointer hover:underline font-normal"
              style={{ color: "#006A20" }}
              onClick={() => router.push("/members/login")}
            >
              로그인
            </span>
          </p>
        </div>

        {/* 모달 */}
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
      </div>
    </main>
  );
}