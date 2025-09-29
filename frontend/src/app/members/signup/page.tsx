// app/sign-up/page.tsx
export default function SignUp() {
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
          <form className="flex flex-col gap-6">
            {/* 이름 */}
            <div className="flex flex-col">
              <label className="text-[14px] font-medium text-[var(--foreground)]">
                이름
              </label>
              <input
                type="text"
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
                placeholder="이메일을 입력하세요"
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
                placeholder="비밀번호를 다시 입력하세요"
                className="mt-2 h-[36px] rounded-[10px] border border-[var(--border)] bg-[var(--input)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* 약관 체크 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 border border-gray-400 rounded"
              />
              <span className="text-[14px] font-medium text-[var(--primary)]">
                이용약관 및 개인정보처리방침에 동의합니다.
              </span>
            </div>

            {/* 가입 버튼 */}
            <button
              type="submit"
              className="w-full h-[36px] bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[10px]"
            >
              회원가입
            </button>

            {/* 로그인 링크 */}
            <p className="text-[14px] font-light text-[var(--muted-foreground)] text-center">
              이미 계정이 있으신가요?{" "}
              <span className="text-[var(--primary)]">로그인</span>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
