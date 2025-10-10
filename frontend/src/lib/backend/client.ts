const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiFetch = (url: string) => {
  return fetch(`${API_BASE_URL}${url}`).then((response) => response.json());
};
