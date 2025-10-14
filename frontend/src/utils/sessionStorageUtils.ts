// 세션 스토리지 관리 유틸리티

const TTL = 30 * 60 * 1000; // 30분

export const sessionStorageUtils = {
  // 세션 스토리지 TTL 확인
  isSessionValid: (timeKey: string): boolean => {
    const savedTime = sessionStorage.getItem(timeKey);
    return savedTime ? (Date.now() - parseInt(savedTime)) < TTL : false;
  },

  // 파일 상태 저장
  setProjectFiles: <T>(projectId: string, files: T[]): void => {
    const filesKey = `projectFiles_${projectId}`;
    const timeKey = `projectFilesTime_${projectId}`;
    
    sessionStorage.setItem(filesKey, JSON.stringify(files));
    sessionStorage.setItem(timeKey, Date.now().toString());
  },

  // 파일 상태 불러오기
  getProjectFiles: <T>(projectId: string): T[] | null => {
    const filesKey = `projectFiles_${projectId}`;
    const timeKey = `projectFilesTime_${projectId}`;
    
    if (!sessionStorageUtils.isSessionValid(timeKey)) {
      sessionStorageUtils.clearProjectFiles(projectId);
      return null;
    }

    try {
      const savedFiles = sessionStorage.getItem(filesKey);
      return savedFiles ? JSON.parse(savedFiles) : null;
    } catch (error) {
      console.error('세션 스토리지 파일 파싱 실패:', error);
      sessionStorageUtils.clearProjectFiles(projectId);
      return null;
    }
  },

  // 파일 상태 삭제
  clearProjectFiles: (projectId: string): void => {
    const filesKey = `projectFiles_${projectId}`;
    const timeKey = `projectFilesTime_${projectId}`;
    
    sessionStorage.removeItem(filesKey);
    sessionStorage.removeItem(timeKey);
  },

  // 프로젝트 업데이트 플래그 설정
  setProjectUpdated: (projectId: string): void => {
    const updateKey = `projectUpdated_${projectId}`;
    const timeKey = `projectUpdateTime_${projectId}`;
    
    sessionStorage.setItem(updateKey, 'true');
    sessionStorage.setItem(timeKey, Date.now().toString());
  },

  // 프로젝트 업데이트 플래그 확인 및 삭제
  checkAndClearProjectUpdated: (projectId: string): boolean => {
    const updateKey = `projectUpdated_${projectId}`;
    const timeKey = `projectUpdateTime_${projectId}`;
    
    const isUpdated = sessionStorage.getItem(updateKey) === 'true';
    
    if (isUpdated) {
      sessionStorage.removeItem(updateKey);
      sessionStorage.removeItem(timeKey);
    }
    
    return isUpdated;
  },

  // 캐시 방지 헤더 생성
  getCacheBustingHeaders: () => ({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }),

  // 캐시 방지 URL 생성
  addCacheBuster: (url: string): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_t=${Date.now()}`;
  },

  // 즐겨찾기 상태 저장
  setFavoriteStatus: (projectId: number, isFavorite: boolean): void => {
    const favoriteKey = `favorite_${projectId}`;
    const timeKey = `favoriteTime_${projectId}`;
    
    sessionStorage.setItem(favoriteKey, JSON.stringify(isFavorite));
    sessionStorage.setItem(timeKey, Date.now().toString());
    
    // 즐겨찾기 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('favoriteStatusChanged', {
      detail: { projectId, isFavorite }
    }));
  },

  // 즐겨찾기 상태 불러오기
  getFavoriteStatus: (projectId: number): boolean | null => {
    const favoriteKey = `favorite_${projectId}`;
    
    try {
      const savedFavorite = sessionStorage.getItem(favoriteKey);
      return savedFavorite ? JSON.parse(savedFavorite) : null;
    } catch (error) {
      console.error('세션 스토리지 즐겨찾기 파싱 실패:', error);
      sessionStorageUtils.clearFavoriteStatus(projectId);
      return null;
    }
  },

  // 즐겨찾기 상태 삭제
  clearFavoriteStatus: (projectId: number): void => {
    const favoriteKey = `favorite_${projectId}`;
    const timeKey = `favoriteTime_${projectId}`;
    
    sessionStorage.removeItem(favoriteKey);
    sessionStorage.removeItem(timeKey);
  },

  // 전체 즐겨찾기 목록 저장
  setFavoriteList: (userId: number, favoriteIds: number[]): void => {
    const listKey = `favoriteList_${userId}`;
    const timeKey = `favoriteListTime_${userId}`;
    
    sessionStorage.setItem(listKey, JSON.stringify(favoriteIds));
    sessionStorage.setItem(timeKey, Date.now().toString());
  },

  // 전체 즐겨찾기 목록 불러오기
  getFavoriteList: (userId: number): number[] | null => {
    const listKey = `favoriteList_${userId}`;
    const timeKey = `favoriteListTime_${userId}`;
    
    if (!sessionStorageUtils.isSessionValid(timeKey)) {
      sessionStorageUtils.clearFavoriteList(userId);
      return null;
    }

    try {
      const savedList = sessionStorage.getItem(listKey);
      return savedList ? JSON.parse(savedList) : null;
    } catch (error) {
      console.error('세션 스토리지 즐겨찾기 목록 파싱 실패:', error);
      sessionStorageUtils.clearFavoriteList(userId);
      return null;
    }
  },

  // 전체 즐겨찾기 목록 삭제
  clearFavoriteList: (userId: number): void => {
    const listKey = `favoriteList_${userId}`;
    const timeKey = `favoriteListTime_${userId}`;
    
    sessionStorage.removeItem(listKey);
    sessionStorage.removeItem(timeKey);
  }
};
