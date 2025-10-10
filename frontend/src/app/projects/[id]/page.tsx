"use client";

import { components } from '@/lib/backend/schema';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectResponse = components['schemas']['ProjectResponse'];

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const fetchProject = async () => {
      if (!params?.id) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (response.ok) {
          const data: ProjectResponse = await response.json();
          setProject(data);
        } else if (response.status === 404) {
          setError('프로젝트를 찾을 수 없습니다.');
        } else {
          setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('프로젝트 조회 실패:', error);
        setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params?.id]);

  // 예산 타입을 한국어로 변환
  const getBudgetTypeText = (budgetType?: string) => {
    const budgetMap: Record<string, string> = {
      'RANGE_1_100': '1만원 ~ 100만원',
      'RANGE_100_200': '100만원 ~ 200만원',
      'RANGE_200_300': '200만원 ~ 300만원',
      'RANGE_300_500': '300만원 ~ 500만원',
      'RANGE_500_1000': '500만원 ~ 1000만원',
      'RANGE_1000_2000': '1000만원 ~ 2000만원',
      'RANGE_2000_3000': '2000만원 ~ 3000만원',
      'RANGE_3000_5000': '3000만원 ~ 5000만원',
      'RANGE_5000_OVER': '5000만원 ~ 1억',
      'OVER_1_EUK': '1억 이상',
      'NEGOTIABLE': '협의'
    };
    return budgetMap[budgetType || ''] || '미정';
  };

  // 프로젝트 필드를 한국어로 변환
  const getProjectFieldText = (field?: string) => {
    const fieldMap: Record<string, string> = {
      'PLANNING': '기획',
      'DESIGN': '디자인',
      'DEVELOPMENT': '개발'
    };
    return fieldMap[field || ''] || field || '';
  };

  // 모집 형태를 한국어로 변환
  const getRecruitmentTypeText = (recruitmentType?: string) => {
    const recruitmentMap: Record<string, string> = {
      'PROJECT_CONTRACT': '외주',
      'PERSONAL_CONTRACT': '상주'
    };
    return recruitmentMap[recruitmentType || ''] || '';
  };



  // 파트너 타입을 한국어로 변환
  const getPartnerTypeText = (partnerType?: string) => {
    const partnerMap: Record<string, string> = {
      'INDIVIDUAL_FREELANCER': '개인 프리랜서',
      'INDIVIDUAL_OR_TEAM_FREELANCER': '개인 또는 팀 프리랜서',
      'BUSINESS_TEAM_OR_COMPANY': '사업자 또는 업체',
      'ANY_TYPE': '상관없음',
      'ETC': '기타'
    };
    return partnerMap[partnerType || ''] || '';
  };

  // 파일 크기 포맷
  const formatFileSize = (size?: number) => {
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

  // 기술스택을 한국어로 변환
  const getTechStackText = (techStack?: string) => {
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
    return techMap[techStack || ''] || techStack || '';
  };

  // 기술 이름으로 카테고리 자동 판단
  const getTechCategoryFromName = (techName?: string) => {
    if (!techName) return '';
    
    const frontendTechs = ['REACT', 'VUE', 'ANGULAR', 'JAVASCRIPT', 'TYPESCRIPT', 'HTML', 'CSS', 'SASS', 'TAILWIND_CSS', 'NEXT_JS', 'NUXT_JS', 'SVELTE'];
    const backendTechs = ['SPRING_BOOT', 'SPRING', 'NODE_JS', 'EXPRESS', 'DJANGO', 'FLASK', 'FAST_API', 'JAVA', 'PYTHON', 'KOTLIN', 'GO', 'RUST', 'PHP', 'LARAVEL', 'NEST_JS'];
    const databaseTechs = ['MYSQL', 'POSTGRESQL', 'MONGODB', 'REDIS', 'ORACLE', 'MSSQL', 'SQLITE', 'MARIADB', 'ELASTICSEARCH', 'FIREBASE'];
    
    if (frontendTechs.includes(techName.toUpperCase())) return 'FRONTEND';
    if (backendTechs.includes(techName.toUpperCase())) return 'BACKEND';
    if (databaseTechs.includes(techName.toUpperCase())) return 'DATABASE';
    
    return '';
  };

  // D-day 계산
  const calculateDday = (endDate?: string) => {
    if (!endDate) return '';
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `D-${diffDays}` : '마감';
  };

  // 진행상황을 한국어로 변환
  const getProgressStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      'IDEA_STAGE': '아이디어 구상 단계에요.',
      'CONTENT_ORGANIZED': '필요한 내용이 정리되었어요.',
      'DETAILED_PLAN': '상세 기획서가 있어요.'
    };
    return statusMap[status || ''] || status || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div className="max-w-[800px] mx-auto p-6" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '32px', textAlign: 'center' }}>
            <div className="animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" style={{ height: '32px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '75%', marginBottom: '16px' }}></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '50%', marginBottom: '24px' }}></div>
              <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="h-4 bg-gray-200 rounded" style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                <div className="h-4 bg-gray-200 rounded w-5/6" style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '83.333333%' }}></div>
                <div className="h-4 bg-gray-200 rounded w-4/6" style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '66.666667%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div className="max-w-[800px] mx-auto p-6" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '32px', textAlign: 'center' }}>
            <div className="text-red-500 text-lg mb-4" style={{ color: '#ef4444', fontSize: '18px', marginBottom: '16px' }}>{error || '프로젝트를 찾을 수 없습니다.'}</div>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
              onClick={() => router.back()}
            >
              뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 탭 네비게이션을 위한 스크롤 함수
  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };



  return (
    <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div className="max-w-[800px] mx-auto p-6" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        {/* 프로젝트 목록으로 돌아가기 */}
        <div className="mb-4" style={{ marginBottom: '16px' }}>
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#4b5563', 
              fontSize: '14px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              transition: 'color 0.2s' 
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.color = '#1f2937'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.color = '#4b5563'}
          >
            ← 프로젝트 목록으로
          </button>
        </div>

        {/* 상단 프로젝트 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm mb-6" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '24px' }}>
          <div className="p-6 border-b" style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>

            
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              {project.title}
            </h1>
            
            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#4b5563' }}>
              <span>분야: {getProjectFieldText(project.projectField)}</span>
              <span>모집형태: {getRecruitmentTypeText(project.recruitmentType)}</span>
              <span>지원자수: {project.applicantCount || 0}명</span>
              {project.endDate && (
                <span>마감일정: {calculateDday(project.endDate)}</span>
              )}
              {project.progressStatus && (
                <span>진행상황: {getProgressStatusText(project.progressStatus)}</span>
              )}
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => scrollToSection('summary')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'summary' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'summary' ? '#2563eb' : '#6b7280',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'summary') {
                  (e.target as HTMLButtonElement).style.color = '#374151';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'summary') {
                  (e.target as HTMLButtonElement).style.color = '#6b7280';
                }
              }}
            >
              요약
            </button>
            <button
              onClick={() => scrollToSection('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'details' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'details' ? '#2563eb' : '#6b7280',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'details') {
                  (e.target as HTMLButtonElement).style.color = '#374151';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'details') {
                  (e.target as HTMLButtonElement).style.color = '#6b7280';
                }
              }}
            >
              업무내용
            </button>
            <button
              onClick={() => scrollToSection('files')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'files'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'files' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'files' ? '#2563eb' : '#6b7280',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => {
                if (activeTab !== 'files') {
                  (e.target as HTMLButtonElement).style.color = '#374151';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'files') {
                  (e.target as HTMLButtonElement).style.color = '#6b7280';
                }
              }}
            >
              참고파일
            </button>
          </div>
        </div>



        {/* 요약 섹션 */}
        <div id="summary" className="bg-white rounded-lg shadow-sm mb-6 p-6" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '24px', padding: '24px' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>프로젝트 요약</h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '14px', marginBottom: '16px' }}>
            <div>
              <span className="text-gray-600" style={{ color: '#4b5563' }}>예산:</span>
              <span className="ml-2 font-medium" style={{ marginLeft: '8px', fontWeight: '500', color: '#111827' }}>{getBudgetTypeText(project.budgetType)}</span>
            </div>
            <div>
              <span className="text-gray-600" style={{ color: '#4b5563' }}>선호파트너:</span>
              <span className="ml-2 font-medium" style={{ marginLeft: '8px', fontWeight: '500', color: '#111827' }}>{getPartnerTypeText(project.partnerType)}</span>
            </div>
            {project.companyLocation && (
              <div>
                <span className="text-gray-600" style={{ color: '#4b5563' }}>지역:</span>
                <span className="ml-2 font-medium" style={{ marginLeft: '8px', fontWeight: '500', color: '#111827' }}>{project.companyLocation}</span>
              </div>
            )}
            {project.startDate && project.endDate && (
              <div className={project.companyLocation ? '' : 'col-span-2'} style={project.companyLocation ? {} : { gridColumn: 'span 2' }}>
                <span className="text-gray-600" style={{ color: '#4b5563' }}>기간:</span>
                <span className="ml-2 font-medium" style={{ marginLeft: '8px', fontWeight: '500', color: '#111827' }}>
                  {new Date(project.startDate).toLocaleDateString()} ~ {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          {/* 기술 스택 */}
          {project.techStacks?.length && (
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <h3 className="font-medium mb-3" style={{ fontWeight: '500', marginBottom: '12px', color: '#111827' }}>기술 스택</h3>
              <div className="flex flex-wrap gap-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(() => {
                  // 카테고리별로 기술들을 그룹화
                  const techsByCategory: Record<string, string[]> = {};
                  
                  project.techStacks.forEach((tech) => {
                    const category = tech.techCategory || getTechCategoryFromName(tech.techName) || 'OTHER';
                    const techDisplayName = getTechStackText(tech.techName);
                    
                    if (!techsByCategory[category]) {
                      techsByCategory[category] = [];
                    }
                    techsByCategory[category].push(techDisplayName);
                  });
                  
                  // 각 카테고리별로 태그 생성
                  return Object.entries(techsByCategory).map(([category, techs]) => (
                    <span key={category} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs" style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '4px', fontSize: '12px' }}>
                      {category === 'OTHER' ? techs.join(', ') : `${category}: ${techs.join(', ')}`}
                    </span>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* 업무내용 섹션 */}
        <div id="details" className="bg-white rounded-lg shadow-sm mb-6 p-6" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '24px', padding: '24px' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>업무내용</h2>
          <div className="prose max-w-none" style={{ maxWidth: 'none' }}>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: '1.625' }}>
              {project.description || '업무 내용이 등록되지 않았습니다.'}
            </div>
          </div>
        </div>

        {/* 참고파일 섹션 */}
        <div id="files" className="bg-white rounded-lg shadow-sm mb-6 p-6" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '24px', padding: '24px' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>참고파일</h2>
          {project.projectFiles?.length ? (
            <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {project.projectFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center" style={{ width: '32px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    📄
                  </div>
                  <div className="flex-1" style={{ flex: 1 }}>
                    <div className="font-medium" style={{ fontWeight: '500', color: '#111827' }}>{file.originalName}</div>
                    <div className="text-sm text-gray-500" style={{ fontSize: '14px', color: '#6b7280' }}>
                      {formatFileSize(file.fileSize)}
                      {file.uploadDate && (
                        <span> • {new Date(file.uploadDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    style={{ padding: '4px 12px', fontSize: '14px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
                    onClick={() => {
                      console.log('파일 다운로드:', file.id);
                      // window.open(`/api/projects/${project.id}/files/${file.id}/download`);
                    }}
                  >
                    다운로드
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8" style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>
              참고파일이 없습니다.
            </div>
          )}
        </div>

        {/* 지원하기 버튼 */}
        {project.status === 'RECRUITING' && (
          <div className="bg-white rounded-lg shadow-sm p-6" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '24px' }}>
            <button 
              className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
              style={{ width: '100%', padding: '12px 0', backgroundColor: '#3b82f6', color: 'white', fontWeight: '500', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
            >
              지원하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
