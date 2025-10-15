/**
 * 즐겨찾기 관련 유틸리티 함수들
 */

/**
 * API 기본 URL 확인 (프록시 경로 사용)
 */
const getApiBaseUrl = (): string => {
  // Next.js 프록시를 사용하므로 빈 문자열 반환
  return '';
};

/**
 * 즐겨찾기 토글 (추가/제거)
 */
export const toggleFavorite = async (projectId: number, memberId: number): Promise<boolean> => {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/projects/favorites/${projectId}/toggle?memberId=${memberId}`;
    console.log('즐겨찾기 토글 API 호출:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('즐겨찾기 토글 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('즐겨찾기 토글 응답 데이터:', data);
      // API 응답 구조에 맞게 성공 여부 확인
      return data.resultCode === '200-1' || data.statusCode === 200 || data.msg === '성공';
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
export const getFavoriteStatus = async (projectId: number, memberId: number): Promise<boolean> => {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/projects/favorites/${projectId}/status?memberId=${memberId}`;
    console.log('즐겨찾기 상태 조회 API 호출:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('즐겨찾기 상태 조회 응답 상태:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('즐겨찾기 상태 조회 응답 데이터:', data);
      // API 응답 구조에 맞게 즐겨찾기 상태 확인
      return data.Data?.isFavorite || data.data?.isFavorite || data.isFavorite || false;
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
export const getUserFavoriteProjectIds = async (memberId: number): Promise<number[]> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/projects/favorites/member/${memberId}`;
  console.log('사용자 즐겨찾기 목록 조회 API 호출:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('사용자 즐겨찾기 목록 조회 응답 상태:', response.status);

    if (response.ok) {
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('응답 JSON 파싱 실패:', jsonError);
        return [];
      }
      
      console.log('사용자 즐겨찾기 목록 조회 응답 데이터:', data);
      
      // 다양한 응답 구조 대응 (Data 대문자 포함)
      const projectIds = data?.Data || data?.data || data?.result || data || [];
      
      // 숫자 배열인지 확인하고 반환
      if (Array.isArray(projectIds)) {
        const validIds = projectIds.filter(id => typeof id === 'number');
        console.log('유효한 즐겨찾기 프로젝트 IDs:', validIds);
        return validIds;
      }
      
      console.warn('예상하지 못한 응답 구조:', typeof projectIds, projectIds);
      return [];
    } else {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (textError) {
        console.warn('응답 텍스트 읽기 실패:', textError);
        errorText = 'Unable to read response text';
      }
      
      console.error('사용자 즐겨찾기 목록 조회 실패:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        memberId: memberId,
        error: errorText || 'No error text available',
        headers: Object.fromEntries(response.headers.entries())
      });
      return [];
    }
  } catch (error) {
    console.error('사용자 즐겨찾기 목록 조회 중 네트워크 오류:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      url: url,
      memberId: memberId
    });
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
