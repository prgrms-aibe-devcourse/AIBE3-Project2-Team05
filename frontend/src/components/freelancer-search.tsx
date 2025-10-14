"use client";

export function FreelancerSearch() {
  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400">
          🔍
        </span>
        <input
          type="search"
          placeholder="기술 스택, 이름, 키워드로 검색..."
          className="pl-10 h-11 w-full border rounded px-3"
        />
      </div>
      <select
        defaultValue="relevance"
        className="w-[180px] h-11 border rounded px-3"
      >
        <option value="relevance">관련도순</option>
        <option value="rating">평점 높은순</option>
        <option value="experience">경력순</option>
        <option value="rate-low">시급 낮은순</option>
        <option value="rate-high">시급 높은순</option>
        <option value="recent">최근 활동순</option>
      </select>
    </div>
  );
}
