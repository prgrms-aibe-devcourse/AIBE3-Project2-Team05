const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

export const apiFetch = (url: string, options?: RequestInit) => {
  const requestOptions: RequestInit = {
    ...(options ?? {}),
    credentials: "include",
  };

  if (requestOptions.body) {
    const headers = new Headers(requestOptions.headers || {});

    // 이미 호출하는 쪽에서 Content-Type을 지정했다면 덮어쓰지 않고 그대로 사용
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    requestOptions.headers = headers;
  }

  return fetch(`${API_BASE_URL}${url}`, requestOptions).then((res) => res.json());
};

async function fetchRsData<T>(endpoint: string, options?: RequestInit): Promise<RsData<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { msg?: string }).msg || "API request failed");
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchRsData<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchRsData<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchRsData<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchRsData<T>(endpoint, { ...options, method: "DELETE" }),
};
