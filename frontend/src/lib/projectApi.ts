const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// ✅ JWT 토큰 가져오기 헬퍼 함수
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
}

// ✅ 공통 fetch 함수 (Authorization 헤더 자동 추가)
async function fetchBase<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    headers,
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    let msg = "요청 실패";
    try {
      const data = await res.json();
      msg = data?.message || JSON.stringify(data);
    } catch {
      msg = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export interface ProjectSummary {
  id: number;
  title: string;
  status: string; // "모집중" | "진행중" | "완료" ...
  createdAt: string;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  techStack?: string[];
  region?: string;
  budget?: number;
}

// ✅ 프로젝트 완료 처리 API
export async function completeProject(projectId: number) {
  return fetchBase<void>(`/api/projects/${projectId}/complete`, {
    method: "PUT",
  });
}

// ✅ 프로젝트 상태 조회
export async function getProjectStatus(projectId: number): Promise<string> {
  return fetchBase<string>(`/api/projects/${projectId}/status`);
}

// ✅ 특정 프로젝트 상세조회
export async function getProjectDetail(projectId: number): Promise<ProjectDetail> {
  return fetchBase<ProjectDetail>(`/api/projects/${projectId}`);
}

// ✅ 프로젝트 전체 목록 조회
export async function getAllProjects(): Promise<ProjectSummary[]> {
  return fetchBase<ProjectSummary[]>(`/api/projects`);
}

// ✅ 프로젝트 상태 변경 (예: 진행중 → 완료)
export async function updateProjectStatus(projectId: number, newStatus: string): Promise<ProjectDetail> {
  return fetchBase<ProjectDetail>(`/api/projects/${projectId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: newStatus }),
  });
}
