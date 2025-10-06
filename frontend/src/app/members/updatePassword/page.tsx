"use client";
import { useState } from "react";

export default function UpdatePassword() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

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
            newPasswordCheck, // 백엔드 DTO와 맞춰서 보내기
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.msg || "비밀번호 재설정 실패");
        return;
      }

      setInfoMsg(data.msg);
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
      <div className="relative z-10 w-[448px] h-[500px] flex flex-col items-center">
        <div className="flex flex-col items-center mt-4">
          <h1 className="text-[30px] font-bold text-[var(--primary)]">FIT</h1>
          <p className="text-[16px] font-normal text-[var(--muted-foreground)] mt-2">
            비밀번호 재설정
          </p>
        </div>

        <div className="mt-6 w-full bg-[#FDFCF8] shadow-lg rounded-[16px] flex-1 p-6 flex flex-col gap-4">
          {/* 아이디, 이메일 */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--foreground)]">
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
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

          {/* 인증 코드 발송 버튼 */}
          <button
            type="button"
            onClick={sendCode}
            className="w-full h-[36px] bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[10px]"
          >
            인증 코드 발송
          </button>

          {codeSent && (
            <>
              {/* 인증 코드 입력 */}
              <div className="flex flex-col">
                <label className="text-[14px] font-medium text-[var(--foreground)]">
                  인증 코드
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="인증 코드를 입력하세요"
                  className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              {/* 새 비밀번호 */}
              <div className="flex flex-col">
                <label className="text-[14px] font-medium text-[var(--foreground)]">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[14px] font-medium text-[var(--foreground)]">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={newPasswordCheck}
                  onChange={(e) => setNewPasswordCheck(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              {/* 비밀번호 재설정 버튼 */}
              <button
                type="button"
                onClick={resetPassword}
                className="w-full h-[36px] bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[10px]"
              >
                비밀번호 변경
              </button>
            </>
          )}

          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
          {infoMsg && <p className="text-green-600">{infoMsg}</p>}
        </div>
      </div>
    </main>
  );
}
