// 프로젝트 관련 옵션 상수들

export const budgetOptions = [
  { value: 'RANGE_1_100', label: '1만원 ~ 100만원' },
  { value: 'RANGE_100_200', label: '100만원 ~ 200만원' },
  { value: 'RANGE_200_300', label: '200만원 ~ 300만원' },
  { value: 'RANGE_300_500', label: '300만원 ~ 500만원' },
  { value: 'RANGE_500_1000', label: '500만원 ~ 1000만원' },
  { value: 'RANGE_1000_2000', label: '1000만원 ~ 2000만원' },
  { value: 'RANGE_2000_3000', label: '2000만원 ~ 3000만원' },
  { value: 'RANGE_3000_5000', label: '3000만원 ~ 5000만원' },
  { value: 'RANGE_5000_OVER', label: '5000만원 ~ 1억원' },
  { value: 'OVER_1_EUK', label: '1억원 이상' },
  { value: 'NEGOTIABLE', label: '협의' }
];

export const regionOptions = [
  { value: 'SEOUL', label: '서울' },
  { value: 'BUSAN', label: '부산' },
  { value: 'DAEGU', label: '대구' },
  { value: 'INCHEON', label: '인천' },
  { value: 'GWANGJU', label: '광주' },
  { value: 'DAEJEON', label: '대전' },
  { value: 'ULSAN', label: '울산' },
  { value: 'SEJONG', label: '세종' },
  { value: 'GYEONGGI', label: '경기' },
  { value: 'GANGWON', label: '강원' },
  { value: 'CHUNGBUK', label: '충북' },
  { value: 'CHUNGNAM', label: '충남' },
  { value: 'JEONBUK', label: '전북' },
  { value: 'JEONNAM', label: '전남' },
  { value: 'GYEONGBUK', label: '경북' },
  { value: 'GYEONGNAM', label: '경남' },
  { value: 'JEJU', label: '제주' },
  { value: 'OVERSEAS', label: '해외' }
];

export const techStackCategories = {
  'Frontend': [
    { value: 'REACT', label: 'React' },
    { value: 'VUE', label: 'Vue.js' },
    { value: 'ANGULAR', label: 'Angular' },
    { value: 'JAVASCRIPT', label: 'JavaScript' },
    { value: 'TYPESCRIPT', label: 'TypeScript' },
    { value: 'HTML', label: 'HTML' },
    { value: 'CSS', label: 'CSS' },
    { value: 'SASS', label: 'Sass' },
    { value: 'TAILWIND_CSS', label: 'Tailwind CSS' },
    { value: 'NEXT_JS', label: 'Next.js' },
    { value: 'NUXT_JS', label: 'Nuxt.js' },
    { value: 'SVELTE', label: 'Svelte' }
  ],
  'Backend': [
    { value: 'SPRING_BOOT', label: 'Spring Boot' },
    { value: 'SPRING', label: 'Spring' },
    { value: 'NODE_JS', label: 'Node.js' },
    { value: 'EXPRESS', label: 'Express.js' },
    { value: 'DJANGO', label: 'Django' },
    { value: 'FLASK', label: 'Flask' },
    { value: 'FAST_API', label: 'FastAPI' },
    { value: 'JAVA', label: 'Java' },
    { value: 'PYTHON', label: 'Python' },
    { value: 'KOTLIN', label: 'Kotlin' },
    { value: 'GO', label: 'Go' },
    { value: 'RUST', label: 'Rust' },
    { value: 'PHP', label: 'PHP' },
    { value: 'LARAVEL', label: 'Laravel' },
    { value: 'NEST_JS', label: 'NestJS' }
  ],
  'Database': [
    { value: 'MYSQL', label: 'MySQL' },
    { value: 'POSTGRESQL', label: 'PostgreSQL' },
    { value: 'MONGODB', label: 'MongoDB' },
    { value: 'REDIS', label: 'Redis' },
    { value: 'ORACLE', label: 'Oracle' },
    { value: 'MSSQL', label: 'MS SQL' },
    { value: 'MARIADB', label: 'MariaDB' },
    { value: 'SQLITE', label: 'SQLite' },
    { value: 'ELASTICSEARCH', label: 'Elasticsearch' },
    { value: 'FIREBASE', label: 'Firebase' },
    { value: 'DYNAMODB', label: 'DynamoDB' }
  ]
};

export const partnerTypeOptions = [
  { value: 'INDIVIDUAL_FREELANCER', label: '개인 프리랜서를 선호합니다' },
  { value: 'INDIVIDUAL_OR_TEAM_FREELANCER', label: '개인 또는 팀 프리랜서를 선호합니다' },
  { value: 'BUSINESS_TEAM_OR_COMPANY', label: '사업자가 있는 팀단위 또는 기업을 선호합니다' },
  { value: 'ANY_TYPE', label: '어떤 형태든 무관합니다' },
  { value: 'ETC', label: '기타' }
];

export const progressStatusOptions = [
  { value: 'IDEA_STAGE', label: '아이디어 구상 단계에요.', icon: '💡' },
  { value: 'CONTENT_ORGANIZED', label: '필요한 내용이 정리되었어요.', icon: '📋' },
  { value: 'DETAILED_PLAN', label: '상세 기획서가 있어요.', icon: '📊' }
];

export const projectFieldOptions = [
  { value: 'PLANNING', label: '기획' },
  { value: 'DESIGN', label: '디자인' },
  { value: 'DEVELOPMENT', label: '개발' }
];

export const recruitmentTypeOptions = [
  { value: 'PROJECT_CONTRACT', label: '프로젝트 단위 계약(외주)' },
  { value: 'PERSONAL_CONTRACT', label: '개인 인력의 기간/시간제 계약(상주)' }
];
