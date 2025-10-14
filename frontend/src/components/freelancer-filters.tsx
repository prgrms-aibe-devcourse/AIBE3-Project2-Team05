"use client";

import { useState } from "react";

export function FreelancerFilters() {
  const [hourlyRate, setHourlyRate] = useState([0, 200000]);

  return (
    <div className="space-y-6 sticky top-6">
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">필터</h2>
          <button className="h-8 text-xs px-2 rounded border">초기화</button>
        </div>

        <hr className="mb-4" />

        {/* Tech Stack */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-gray-900">기술 스택</h3>
          <div className="space-y-2">
            {[
              "React",
              "Next.js",
              "TypeScript",
              "Node.js",
              "Python",
              "Java",
              "Vue.js",
              "Flutter",
            ].map((tech) => (
              <div key={tech} className="flex items-center space-x-2">
                <input id={tech} type="checkbox" className="w-4 h-4" />
                <label
                  htmlFor={tech}
                  className="text-sm font-normal cursor-pointer"
                >
                  {tech}
                </label>
              </div>
            ))}
          </div>
        </div>

        <hr className="mb-4" />

        {/* Experience Level */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-gray-900">경력</h3>
          <div className="space-y-2">
            {[
              "신입 (0-1년)",
              "주니어 (1-3년)",
              "미들 (3-5년)",
              "시니어 (5년+)",
            ].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <input id={level} type="checkbox" className="w-4 h-4" />
                <label
                  htmlFor={level}
                  className="text-sm font-normal cursor-pointer"
                >
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        <hr className="mb-4" />

        {/* Hourly Rate */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-gray-900">시급</h3>
          <div className="pt-2">
            {/* Simple range inputs: min and max */}
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={hourlyRate[0]}
                onChange={(e) =>
                  setHourlyRate([Number(e.target.value), hourlyRate[1]])
                }
                className="w-1/2 p-2 border rounded"
              />
              <input
                type="number"
                value={hourlyRate[1]}
                onChange={(e) =>
                  setHourlyRate([hourlyRate[0], Number(e.target.value)])
                }
                className="w-1/2 p-2 border rounded"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>₩{hourlyRate[0].toLocaleString()}</span>
              <span>₩{hourlyRate[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <hr className="mb-4" />

        {/* Availability */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-gray-900">가능 여부</h3>
          <div className="space-y-2">
            {["즉시 가능", "1주일 내", "2주일 내", "협의 가능"].map(
              (status) => (
                <div key={status} className="flex items-center space-x-2">
                  <input id={status} type="checkbox" className="w-4 h-4" />
                  <label
                    htmlFor={status}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {status}
                  </label>
                </div>
              )
            )}
          </div>
        </div>

        <hr className="mb-4" />

        {/* Rating */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">평점</h3>
          <div className="space-y-2">
            {["4.5+ ⭐", "4.0+ ⭐", "3.5+ ⭐", "3.0+ ⭐"].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <input id={rating} type="checkbox" className="w-4 h-4" />
                <label
                  htmlFor={rating}
                  className="text-sm font-normal cursor-pointer"
                >
                  {rating}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">적용된 필터</h3>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center gap-2">
            React <button className="text-gray-500">✕</button>
          </span>
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center gap-2">
            시니어 <button className="text-gray-500">✕</button>
          </span>
        </div>
      </div>
    </div>
  );
}
