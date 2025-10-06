"use client";
import { useState } from "react";

export default function FindId() {
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
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
        setErrorMsg(data.message || "아이디 찾기 실패");
        return;
      }

      setInfoMsg(data.msg); // "회원님의 아이디는 xxx 입니다."
    } catch (err) {
      console.error(err);
      setErrorMsg("아이디 찾기 중 오류 발생");
    }
  };

  return (
    <main className="relative w-screen h-screen bg-[var(--background)] flex justify-center items-center overflow-y-auto">
      <div className="absolute inset-0 bg-[rgba(241,234,220,0.3)] z-0"></div>
      <div className="relative z-10 w-[448px] h-[400px] flex flex-col items-center">
        <div className="flex flex-col items-center mt-4">
          <h1 className="text-[30px] font-bold text-[var(--primary)]">FIT</h1>
          <p className="text-[16px] font-normal text-[var(--muted-foreground)] mt-2">
            아이디 찾기
          </p>
        </div>

        <div className="mt-6 w-full bg-[#FDFCF8] shadow-lg rounded-[16px] flex-1 p-6 flex flex-col gap-4">
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

          <button
            type="button"
            onClick={sendCode}
            className="w-full h-[36px] bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[10px]"
          >
            인증 코드 발송
          </button>

          {codeSent && (
            <>
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

              <button
                type="button"
                onClick={verifyId}
                className="w-full h-[36px] bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[10px]"
              >
                아이디 확인
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
