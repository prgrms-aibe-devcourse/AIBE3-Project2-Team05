// 프로젝트 관련 유틸리티 함수들

// 예산 타입을 한국어로 변환
export const getBudgetTypeText = (budgetType?: string): string => {
  if (!budgetType || budgetType.trim() === '' || budgetType === '0') {
    return '미정';
  }
  
  const budgetMap: Record<string, string> = {
    'RANGE_1_100': '1만원 ~ 100만원',
    'RANGE_100_200': '100만원 ~ 200만원',
    'RANGE_200_300': '200만원 ~ 300만원',
    'RANGE_300_500': '300만원 ~ 500만원',
    'RANGE_500_1000': '500만원 ~ 1000만원',
    'RANGE_1000_2000': '1000만원 ~ 2000만원',
    'RANGE_2000_3000': '2000만원 ~ 3000만원',
    'RANGE_3000_5000': '3000만원 ~ 5000만원',
    'RANGE_5000_OVER': '5000만원 ~ 1억원',
    'OVER_1_EUK': '1억원 이상',
    'NEGOTIABLE': '협의'
  };
  return budgetMap[budgetType] || '미정';
};

// 프로젝트 필드를 한국어로 변환
export const getProjectFieldText = (field?: string): string => {
  if (!field || field.trim() === '' || field === '0') {
    return '';
  }
  
  const fieldMap: Record<string, string> = {
    'PLANNING': '기획',
    'DESIGN': '디자인',
    'DEVELOPMENT': '개발'
  };
  return fieldMap[field] || field;
};

// 모집 형태를 한국어로 변환
export const getRecruitmentTypeText = (recruitmentType?: string): string => {
  if (!recruitmentType || recruitmentType.trim() === '' || recruitmentType === '0') {
    return '';
  }
  
  const recruitmentMap: Record<string, string> = {
    'PROJECT_CONTRACT': '외주',
    'PERSONAL_CONTRACT': '상주'
  };
  return recruitmentMap[recruitmentType] || '';
};

// 지역을 한국어로 변환
export const getLocationText = (location?: string): string => {
  if (!location || location.trim() === '' || location === '0') {
    return '';
  }
  
  const locationMap: Record<string, string> = {
    'SEOUL': '서울',
    'BUSAN': '부산',
    'DAEGU': '대구',
    'INCHEON': '인천',
    'GWANGJU': '광주',
    'DAEJEON': '대전',
    'ULSAN': '울산',
    'SEJONG': '세종',
    'GYEONGGI': '경기',
    'GANGWON': '강원',
    'CHUNGBUK': '충북',
    'CHUNGNAM': '충남',
    'JEONBUK': '전북',
    'JEONNAM': '전남',
    'GYEONGBUK': '경북',
    'GYEONGNAM': '경남',
    'JEJU': '제주',
    'OVERSEAS': '해외'
  };
  return locationMap[location] || location;
};

// 파트너 타입을 한국어로 변환
export const getPartnerTypeText = (partnerType?: string): string => {
  if (!partnerType || partnerType.trim() === '' || partnerType === '0') {
    return '';
  }
  
  const partnerMap: Record<string, string> = {
    'INDIVIDUAL_FREELANCER': '개인 프리랜서',
    'INDIVIDUAL_OR_TEAM_FREELANCER': '개인 또는 팀 프리랜서',
    'BUSINESS_TEAM_OR_COMPANY': '사업자 또는 업체',
    'ANY_TYPE': '상관없음',
    'ETC': '기타'
  };
  return partnerMap[partnerType] || '';
};

// 프로젝트 상태를 한국어로 변환
export const getStatusText = (status?: string): string => {
  if (!status || status.trim() === '' || status === '0') {
    return '';
  }
  
  const statusMap: Record<string, string> = {
    'RECRUITING': '모집중',
    'CONTRACTING': '계약중',
    'IN_PROGRESS': '진행중',
    'COMPLETED': '완료',
    'SUSPENDED': '보류',
    'CANCELLED': '취소'
  };
  return statusMap[status] || status;
};

// 진행상황을 한국어로 변환
export const getProgressStatusText = (status?: string): string => {
  if (!status || status.trim() === '' || status === '0') {
    return '';
  }
  
  const statusMap: Record<string, string> = {
    'IDEA_STAGE': '아이디어 구상 단계에요.',
    'CONTENT_ORGANIZED': '필요한 내용이 정리되었어요.',
    'DETAILED_PLAN': '상세 기획서가 있어요.'
  };
  return statusMap[status] || status;
};

// 기술스택을 한국어로 변환
export const getTechStackText = (techStack?: string): string => {
  if (!techStack || techStack.trim() === '' || techStack === '0') {
    return '';
  }
  
  const techMap: Record<string, string> = {
    // Frontend
    'REACT': 'React',
    'VUE': 'Vue.js',
    'ANGULAR': 'Angular',
    'JAVASCRIPT': 'JavaScript',
    'TYPESCRIPT': 'TypeScript',
    'HTML': 'HTML',
    'CSS': 'CSS',
    'SASS': 'Sass',
    'TAILWIND_CSS': 'Tailwind CSS',
    'NEXT_JS': 'Next.js',
    'NUXT_JS': 'Nuxt.js',
    'SVELTE': 'Svelte',
    // Backend
    'SPRING_BOOT': 'Spring Boot',
    'SPRING': 'Spring',
    'NODE_JS': 'Node.js',
    'EXPRESS': 'Express.js',
    'DJANGO': 'Django',
    'FLASK': 'Flask',
    'FAST_API': 'FastAPI',
    'JAVA': 'Java',
    'PYTHON': 'Python',
    'KOTLIN': 'Kotlin',
    'GO': 'Go',
    'RUST': 'Rust',
    'PHP': 'PHP',
    'LARAVEL': 'Laravel',
    'NEST_JS': 'NestJS',
    // Database
    'MYSQL': 'MySQL',
    'POSTGRESQL': 'PostgreSQL',
    'MONGODB': 'MongoDB',
    'REDIS': 'Redis',
    'ORACLE': 'Oracle',
    'MSSQL': 'MS SQL',
    'SQLITE': 'SQLite',
    'MARIADB': 'MariaDB',
    'ELASTICSEARCH': 'Elasticsearch',
    'FIREBASE': 'Firebase'
  };
  return techMap[techStack] || techStack;
};

// 기술 이름으로 카테고리 자동 판단
export const getTechCategoryFromName = (techName?: string): string => {
  if (!techName) return '';
  
  const frontendTechs = ['REACT', 'VUE', 'ANGULAR', 'JAVASCRIPT', 'TYPESCRIPT', 'HTML', 'CSS', 'SASS', 'TAILWIND_CSS', 'NEXT_JS', 'NUXT_JS', 'SVELTE'];
  const backendTechs = ['SPRING_BOOT', 'SPRING', 'NODE_JS', 'EXPRESS', 'DJANGO', 'FLASK', 'FAST_API', 'JAVA', 'PYTHON', 'KOTLIN', 'GO', 'RUST', 'PHP', 'LARAVEL', 'NEST_JS'];
  const databaseTechs = ['MYSQL', 'POSTGRESQL', 'MONGODB', 'REDIS', 'ORACLE', 'MSSQL', 'SQLITE', 'MARIADB', 'ELASTICSEARCH', 'FIREBASE'];
  
  if (frontendTechs.includes(techName.toUpperCase())) return 'FRONTEND';
  if (backendTechs.includes(techName.toUpperCase())) return 'BACKEND';
  if (databaseTechs.includes(techName.toUpperCase())) return 'DATABASE';
  
  return '';
};

// 파일 크기 포맷
export const formatFileSize = (size?: number): string => {
  if (!size) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let formattedSize = size;
  
  while (formattedSize >= 1024 && index < units.length - 1) {
    formattedSize /= 1024;
    index++;
  }
  
  return `${formattedSize.toFixed(1)} ${units[index]}`;
};

// 한글 지역명을 영어 코드로 변환
export const getLocationCodeFromText = (locationText: string): string => {
  const locationCodeMap: Record<string, string> = {
    '서울': 'SEOUL',
    '부산': 'BUSAN',
    '대구': 'DAEGU',
    '인천': 'INCHEON',
    '광주': 'GWANGJU',
    '대전': 'DAEJEON',
    '울산': 'ULSAN',
    '세종': 'SEJONG',
    '경기': 'GYEONGGI',
    '강원': 'GANGWON',
    '충북': 'CHUNGBUK',
    '충남': 'CHUNGNAM',
    '전북': 'JEONBUK',
    '전남': 'JEONNAM',
    '경북': 'GYEONGBUK',
    '경남': 'GYEONGNAM',
    '제주': 'JEJU',
    '해외': 'OVERSEAS',
    '국외': 'OVERSEAS'
  };
  return locationCodeMap[locationText] || locationText;
};

// D-day 계산
export const calculateDday = (endDate?: string): string => {
  if (!endDate) return '';
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `D-${diffDays}` : '마감';
};

// 날짜 포맷팅
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ko-KR');
};

// 날짜를 입력 필드 형태로 변환 (YYYY-MM-DD)
export const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};
