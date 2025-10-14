// app/landing-section/page.tsx
export default function LandingSection() {
  return (
    <section className="absolute h-[494px] left-[312.5px] right-[312.5px] top-[96px]">
      {/* Heading */}
      <h1
        className="absolute w-[919.26px] h-[143px] left-1/2 -translate-x-1/2 top-[3px]
        text-[60px] font-bold leading-[75px] text-center text-[var(--foreground)]"
      >
        당신이 찾는 프리랜서를,
        <br />
        프로젝트와 함께 FIT 하게 찾아드려요
      </h1>

      {/* Subheading */}
      <p
        className="absolute w-[753.95px] h-[50px] left-1/2 -translate-x-1/2 top-[177px]
        text-[20px] font-light leading-[28px] text-center text-[var(--muted-foreground)]"
      >
        전문성과 신뢰성을 갖춘 프리랜서들과 함께하세요. AI 기반 매칭 시스템으로
        당신의 프로젝트에 딱 맞는 최적의 파트너를 빠르게 연결해드립니다.
      </p>

      {/* Call-to-action Button */}
      <button
        className="absolute w-[167.73px] h-[48px] left-1/2 -translate-x-1/2 top-[270px]
        bg-[var(--primary)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <span
          className="absolute w-[104.09px] h-[21px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
          text-[18px] font-medium leading-[28px] text-center text-[var(--card-foreground)]"
        >
          지금 시작하기
        </span>
      </button>

      {/* Stats */}
      <div className="absolute h-[112px] left-[304px] right-[304px] top-[382px] flex justify-between">
        <div className="relative flex flex-col items-center">
          <div className="absolute w-[48px] h-[48px] bg-[rgba(0,106,32,0.1)] rounded-full flex items-center justify-center">
            <div className="w-[24px] h-[24px] border-2 border-[var(--primary)] rounded" />
          </div>
          <span className="absolute top-[60px] font-bold text-[24px] leading-[32px] text-center text-[var(--foreground)]">
            10,000+
          </span>
          <span className="absolute top-[92px] font-light text-[14px] leading-[20px] text-center text-[var(--muted-foreground)]">
            활성 프리랜서
          </span>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="absolute w-[48px] h-[48px] bg-[rgba(220,154,148,0.1)] rounded-full flex items-center justify-center">
            <div className="w-[24px] h-[24px] border-2 border-[#DC9A94] rounded" />
          </div>
          <span className="absolute top-[60px] font-bold text-[24px] leading-[32px] text-center text-[var(--foreground)]">
            5,000+
          </span>
          <span className="absolute top-[92px] font-light text-[14px] leading-[20px] text-center text-[var(--muted-foreground)]">
            완료된 프로젝트
          </span>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="absolute w-[48px] h-[48px] bg-[rgba(220,154,148,0.1)] rounded-full flex items-center justify-center">
            <div className="w-[24px] h-[24px] border-2 border-[#DC9A94] rounded" />
          </div>
          <span className="absolute top-[60px] font-bold text-[24px] leading-[32px] text-center text-[var(--foreground)]">
            4.9/5
          </span>
          <span className="absolute top-[92px] font-light text-[14px] leading-[20px] text-center text-[var(--muted-foreground)]">
            평균 만족도
          </span>
        </div>
      </div>
    </section>
  );
}
