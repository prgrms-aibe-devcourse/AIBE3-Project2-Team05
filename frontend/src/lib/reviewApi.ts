export interface ReviewRequest {
  targetFreelancerId: number; // ✅ 이름 변경
  projectId: number;
  rating: number;
  title: string;
  content: string;
}

export interface ReviewResponse {
  id: number;
  projectId: number;
  authorId: number;
  authorNickname: string; // ✅ 닉네임 표시용 추가
  targetFreelancerId: number; // ✅ 이름 변경
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// ✅ JWT 토큰 가져오기 헬퍼 함수
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
}

// ✅ 공통 fetch 함수 (Authorization 헤더 자동 추가)
export async function fetchBase<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token =
    (typeof window !== "undefined" &&
      (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"))) ||
    null;

  const res = await fetch(`http://localhost:8080${url}`, {
    credentials: "include", // ✅ 쿠키 + CORS
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // ✅ 토큰 자동 추가
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`요청 실패 (${res.status}): ${errorText}`);
  }

  return res.json();
}

// ===== API 함수들 =====

// ✅ 리뷰 생성 (authorId는 백엔드에서 JWT로 추출)
export async function createReview(payload: ReviewRequest) {
  const token =
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // ✅ 토큰 추가
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

// ✅ 리뷰 수정
export async function updateReview(
  reviewId: number,
  payload: Partial<Pick<ReviewRequest, "rating" | "title" | "content">>
) { 
  const token =
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  return fetchBase<ReviewResponse>(`/api/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// ✅ 리뷰 삭제
export async function deleteReview(reviewId: number) {
  const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`리뷰 삭제 실패: ${text}`);
  }

  return true;
}

// ✅ 특정 사용자의 리뷰 목록 조회
export async function getReviews(targetFreelancerId: number) {
  return fetchBase<ReviewResponse[]>(`/api/reviews?targetFreelancerId=${targetFreelancerId}`);
}

// ✅ 평균 평점 조회
export async function getAverageRating(targetFreelancerId: number) {
  return fetchBase<number>(`/api/reviews/average?targetFreelancerId=${targetFreelancerId}`);
}

// ✅ 모든 리뷰 조회
export async function getAllReviews() {
  return fetchBase<ReviewResponse[]>("/api/reviews/all");
}