"use client";

// import { apiFetch } from "@/lib/backend/client";
// import { useEffect, useState } from "react";

// const IMAGE_HOST = "http://localhost:8080";

// function fullImageUrl(url?: string) {
//   if (!url) return undefined;
//   // already absolute
//   if (/^https?:\/\//i.test(url)) return url;
//   // treat as relative path -> prefix host
//   return `${IMAGE_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
// }

// export default function Page() {
//   const [freelancers, setFreelancers] = useState<any[]>([]);
//   const [query, setQuery] = useState("");
//   const [filterType, setFilterType] = useState<string | "">("");

//   useEffect(() => {
//     apiFetch("/api/v1/freelancers").then(setFreelancers);
//   }, []);

//   const lowerQuery = query.trim().toLowerCase();
//   const filtered = freelancers.filter((f: any) => {
//     if (filterType && f.type !== filterType) return false;
//     if (!lowerQuery) return true;
//     const haystack = [f.nickname, f.freelancerTitle, f.content]
//       .filter(Boolean)
//       .join(" ")
//       .toLowerCase();
//     return haystack.includes(lowerQuery);
//   });

//   // derive distinct types for filter select
//   const types = Array.from(
//     new Set(freelancers.map((f) => f.type).filter(Boolean))
//   );

//   return (
//     <>
//       <h1 className="text-2xl font-semibold mb-4">freelancer 페이지</h1>

//       {/* Search / Filter */}
//       <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
//         <input
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="이름, 타이틀, 내용으로 검색"
//           className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring"
//         />

//         <select
//           value={filterType}
//           onChange={(e) => setFilterType(e.target.value)}
//           className="px-3 py-2 border rounded-md"
//         >
//           <option value="">전체 유형</option>
//           {types.map((t) => (
//             <option key={t} value={t}>
//               {t}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Card grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filtered.map((freelancer: any) => (
//           <article
//             key={freelancer.id}
//             className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
//           >
//             <div className="flex items-start gap-3">
//               <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
//                 {freelancer.freelancerProfileImageUrl ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img
//                     src={fullImageUrl(freelancer.freelancerProfileImageUrl)}
//                     alt={`${freelancer.nickname ?? "freelancer"} avatar`}
//                     className="w-full h-full object-contain object-center bg-transparent"
//                   />
//                 ) : (
//                   <span className="text-gray-500 text-base">
//                     {(freelancer.nickname || "?").charAt(0).toUpperCase()}
//                   </span>
//                 )}
//               </div>

//               <div className="flex-1">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="font-medium text-lg">
//                       {freelancer.nickname}
//                     </div>
//                     {freelancer.freelancerTitle && (
//                       <div className="text-sm text-gray-600">
//                         {freelancer.freelancerTitle}
//                       </div>
//                     )}
//                   </div>

//                   <div className="text-sm text-gray-500 text-right">
//                     <div>{freelancer.type}</div>
//                     <div>{freelancer.location}</div>
//                   </div>
//                 </div>

//                 <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
//                   <div>
//                     {freelancer.minMonthlyRate?.toLocaleString?.() ?? "-"} ~{" "}
//                     {freelancer.maxMonthlyRate?.toLocaleString?.() ?? "-"} /월
//                   </div>
//                   <div>
//                     {typeof freelancer.ratingAvg === "number"
//                       ? freelancer.ratingAvg.toFixed(1)
//                       : "-"}
//                     <span className="text-gray-400">
//                       {" "}
//                       ({freelancer.reviewsCount ?? 0})
//                     </span>
//                   </div>
//                 </div>

//                 {freelancer.techNameList &&
//                   freelancer.techNameList.length > 0 && (
//                     <div className="mt-3 flex flex-wrap gap-2">
//                       {freelancer.techNameList.map(
//                         (tech: string, idx: number) => (
//                           <span
//                             key={idx}
//                             className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
//                           >
//                             {tech}
//                           </span>
//                         )
//                       )}
//                     </div>
//                   )}

//                 {freelancer.content && (
//                   <p className="mt-3 text-sm text-gray-700">
//                     {freelancer.content}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </article>
//         ))}
//       </div>
//     </>
//   );
// }

import { FreelancerFilters } from "@/components/freelancer-filters";
import { FreelancerList } from "@/components/freelancer-list";
import { FreelancerSearch } from "@/components/freelancer-search";

export default function FreelancersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            프리랜서 찾기
          </h1>
          <p className="text-sm text-muted-foreground">
            전문 개발자 프리랜서를 검색하고 프로젝트에 초대하세요
          </p>
        </div>
      </header>

      {/* Search and Sort Bar */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <FreelancerSearch />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0">
            <FreelancerFilters />
          </aside>

          {/* Right Content - Freelancer List */}
          <main className="flex-1 min-w-0">
            <FreelancerList />
          </main>
        </div>
      </div>
    </div>
  );
}
