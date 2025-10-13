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
  }
};
