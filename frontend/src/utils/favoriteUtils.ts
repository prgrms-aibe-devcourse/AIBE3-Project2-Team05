/**
 * 즐겨찾기 관련 유틸리티 함수들
 */

/**
 * API 기본 URL 확인
 */
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error('NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.');
    throw new Error('API Base URL이 설정되지 않았습니다.');
  }
  return baseUrl;
};

/**
 * 즐겨찾기 토글 (추가/제거)
 */
export const toggleFavorite = async (projectId: number, userId: number): Promise<boolean> => {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/projects/favorites/${projectId}/toggle?userId=${userId}`;
    console.log('즐겨찾기 토글 API 호출:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('즐겨찾기 토글 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('즐겨찾기 토글 응답 데이터:', data);
      return data.success !== false; // success가 false가 아니면 true로 간주
    } else {
      const errorText = await response.text();
      console.error('즐겨찾기 토글 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return false;
    }
  } catch (error) {
    console.error('즐겨찾기 토글 중 네트워크 오류:', error);
    return false;
  }
};

/**
 * 즐겨찾기 상태 조회
 */
export const getFavoriteStatus = async (projectId: number, userId: number): Promise<boolean> => {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/projects/favorites/${projectId}/status?userId=${userId}`;
    console.log('즐겨찾기 상태 조회 API 호출:', url);
    
    const response = await fetch(url);

    console.log('즐겨찾기 상태 조회 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('즐겨찾기 상태 조회 응답 데이터:', data);
      return data.data?.isFavorite || data.isFavorite || false;
    } else {
      const errorText = await response.text();
      console.error('즐겨찾기 상태 조회 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return false;
    }
  } catch (error) {
    console.error('즐겨찾기 상태 조회 중 네트워크 오류:', error);
    return false;
  }
};

/**
 * 사용자의 즐겨찾기 프로젝트 ID 목록 조회
 */
export const getUserFavoriteProjectIds = async (userId: number): Promise<number[]> => {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/projects/favorites/user/${userId}`;
    console.log('사용자 즐겨찾기 목록 조회 API 호출:', url);
    
    const response = await fetch(url);

    console.log('사용자 즐겨찾기 목록 조회 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('사용자 즐겨찾기 목록 조회 응답 데이터:', data);
      
      // 다양한 응답 구조 대응
      const projectIds = data.data || data.result || data || [];
      
      // 숫자 배열인지 확인하고 반환
      if (Array.isArray(projectIds)) {
        return projectIds.filter(id => typeof id === 'number');
      }
      
      return [];
    } else {
      const errorText = await response.text();
      console.error('사용자 즐겨찾기 목록 조회 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return [];
    }
  } catch (error) {
    console.error('사용자 즐겨찾기 목록 조회 중 네트워크 오류:', error);
    return [];
  }
};

/**
 * 프로젝트 목록을 즐겨찾기 기준으로 정렬
 */
export const sortProjectsByFavorite = <T extends { id: number }>(projects: T[], favoriteProjectIds: number[]) => {
  return [...projects].sort((a, b) => {
    const aIsFavorite = favoriteProjectIds.includes(a.id);
    const bIsFavorite = favoriteProjectIds.includes(b.id);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });
};
