"use client";

import { apiFetch } from "@/lib/backend/client";
import { useEffect, useState } from "react";

const IMAGE_HOST = "http://localhost:8080";

function fullImageUrl(url?: string) {
  if (!url) return undefined;
  // already absolute
  if (/^https?:\/\//i.test(url)) return url;
  // treat as relative path -> prefix host
  return `${IMAGE_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function Page() {
  const [freelancers, setFreelancers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/api/v1/freelancers").then(setFreelancers);
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">freelancer 페이지</h1>

      <ul className="space-y-6">
        {freelancers.map((freelancer: any) => (
          <li key={freelancer.id} className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {freelancer.freelancerProfileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fullImageUrl(freelancer.freelancerProfileImageUrl)}
                  alt={`${freelancer.nickname ?? "freelancer"} avatar`}
                  className="w-full h-full object-contain object-center bg-transparent"
                />
              ) : (
                <span className="text-gray-500 text-base">
                  {(freelancer.nickname || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">
                    {freelancer.nickname}
                  </div>
                  {freelancer.freelancerTitle && (
                    <div className="text-sm text-gray-600">
                      {freelancer.freelancerTitle}
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500 text-right">
                  <div>{freelancer.type}</div>
                  <div>{freelancer.location}</div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <div>
                  요금: {freelancer.minMonthlyRate?.toLocaleString?.() ?? "-"} ~{" "}
                  {freelancer.maxMonthlyRate?.toLocaleString?.() ?? "-"} /월
                </div>
                <div>
                  평점:{" "}
                  {typeof freelancer.ratingAvg === "number"
                    ? freelancer.ratingAvg.toFixed(1)
                    : "-"}{" "}
                  ({freelancer.reviewsCount ?? 0} 리뷰)
                </div>
                <div>완료: {freelancer.completedProjectsCount ?? 0}</div>
              </div>

              {freelancer.techNameList &&
                freelancer.techNameList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {freelancer.techNameList.map(
                      (tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                )}

              {freelancer.content && (
                <p className="mt-3 text-sm text-gray-700">
                  {freelancer.content}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
