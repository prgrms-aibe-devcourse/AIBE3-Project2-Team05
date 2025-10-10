"use client";

import { components } from '@/lib/backend/schema';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectResponse = components['schemas']['ProjectResponse'];

const UserProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const fetchProject = async () => {
      if (!params?.projectId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${params.projectId}`);
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
  }, [params?.projectId]);

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

  // 프로젝트 상태를 한국어로 변환
  const getStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      'RECRUITING': '모집중',
      'CONTRACTING': '계약중',
      'IN_PROGRESS': '진행중',
      'COMPLETED': '완료',
      'SUSPENDED': '보류',
      'CANCELLED': '취소'
    };
    return statusMap[status || ''] || status || '';
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
      'FIREBASE': 'Firebase',
      // Design
      'FIGMA': 'Figma',
      'ADOBE_XD': 'Adobe XD'
    };
    return techMap[techStack || ''] || techStack || '';
  };

  // 기술 이름으로 카테고리 자동 판단
  const getTechCategoryFromName = (techName?: string) => {
    if (!techName) return '';
    
    const frontendTechs = ['REACT', 'VUE', 'ANGULAR', 'JAVASCRIPT', 'TYPESCRIPT', 'HTML', 'CSS', 'SASS', 'TAILWIND_CSS', 'NEXT_JS', 'NUXT_JS', 'SVELTE'];
    const backendTechs = ['SPRING_BOOT', 'SPRING', 'NODE_JS', 'EXPRESS', 'DJANGO', 'FLASK', 'FAST_API', 'JAVA', 'PYTHON', 'KOTLIN', 'GO', 'RUST', 'PHP', 'LARAVEL', 'NEST_JS'];
    const databaseTechs = ['MYSQL', 'POSTGRESQL', 'MONGODB', 'REDIS', 'ORACLE', 'MSSQL', 'SQLITE', 'MARIADB', 'ELASTICSEARCH', 'FIREBASE'];
    const designTechs = ['FIGMA', 'ADOBE_XD'];
    
    if (frontendTechs.includes(techName.toUpperCase())) return 'FRONTEND';
    if (backendTechs.includes(techName.toUpperCase())) return 'BACKEND';
    if (databaseTechs.includes(techName.toUpperCase())) return 'DATABASE';
    if (designTechs.includes(techName.toUpperCase())) return 'DESIGN';
    
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
        <div className="max-w-3xl mx-auto p-6" style={{ maxWidth: '48rem', margin: '0 auto', padding: '24px' }}>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '32px', textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', width: '48px', height: '48px', border: '2px solid transparent', borderBottomColor: '#3b82f6', margin: '0 auto 16px auto' }}></div>
            <div className="text-gray-600" style={{ color: '#4b5563' }}>프로젝트를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div className="max-w-3xl mx-auto p-6" style={{ maxWidth: '48rem', margin: '0 auto', padding: '24px' }}>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '32px', textAlign: 'center' }}>
            <div className="text-red-500 text-lg mb-4" style={{ color: '#ef4444', fontSize: '18px', marginBottom: '16px' }}>{error || '프로젝트를 찾을 수 없습니다.'}</div>
            <button 
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
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
      <div className="max-w-3xl mx-auto p-6" style={{ maxWidth: '48rem', margin: '0 auto', padding: '24px' }}>
        {/* 내 프로젝트 목록으로 돌아가기 */}
        <div className="mb-6" style={{ marginBottom: '24px' }}>
          <button
            onClick={() => router.push(`/user-projects/${params?.managerId}`)}
            className="flex items-center gap-3 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              color: '#4b5563', 
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              transition: 'color 0.2s' 
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.color = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.color = '#4b5563'}
          >
            ← 내 프로젝트 목록으로
          </button>
        </div>

        {/* 상단 프로젝트 기본 정보 */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '32px', overflow: 'hidden' }}>
          <div className="p-8 border-b border-gray-100" style={{ padding: '32px', borderBottom: '1px solid #f3f4f6' }}>
            <div className="flex justify-between items-start mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h1 className="text-3xl font-bold text-gray-900 flex-1 mr-4" style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', flex: 1, marginRight: '16px' }}>
                {project.title}
              </h1>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                project.status === 'RECRUITING' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                project.status === 'CONTRACTING' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                project.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700 border border-green-200' :
                project.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                project.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                'bg-red-100 text-red-700 border border-red-200'
              }`} style={{ 
                padding: '8px 16px', 
                borderRadius: '9999px', 
                fontSize: '14px', 
                fontWeight: '500'
              }}>
                {getStatusText(project.status)}
              </span>
            </div>
            
            <div className="flex items-center flex-wrap gap-6 text-gray-600" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '24px', color: '#4b5563' }}>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="text-sm" style={{ fontSize: '14px' }}>분야:</span>
                <span className="font-medium" style={{ fontWeight: '500' }}>{getProjectFieldText(project.projectField)}</span>
              </span>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="text-sm" style={{ fontSize: '14px' }}>모집형태:</span>
                <span className="font-medium" style={{ fontWeight: '500' }}>{getRecruitmentTypeText(project.recruitmentType)}</span>
              </span>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="text-sm" style={{ fontSize: '14px' }}>지원자수:</span>
                <span className="font-medium text-blue-600" style={{ fontWeight: '500', color: '#2563eb' }}>{project.applicantCount || 0}명</span>
              </span>
              {project.endDate && (
                <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="text-sm" style={{ fontSize: '14px' }}>마감일정:</span>
                  <span className="font-medium text-red-600" style={{ fontWeight: '500', color: '#dc2626' }}>{calculateDday(project.endDate)}</span>
                </span>
              )}
              {project.progressStatus && (
                <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="text-sm" style={{ fontSize: '14px' }}>진행상황:</span>
                  <span className="font-medium" style={{ fontWeight: '500' }}>{getProgressStatusText(project.progressStatus)}</span>
                </span>
              )}
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-gray-100" style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
            <button
              onClick={() => scrollToSection('summary')}
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              style={{
                padding: '16px 32px',
                fontSize: '14px',
                fontWeight: '500',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'summary' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'summary' ? '#2563eb' : '#6b7280',
                backgroundColor: activeTab === 'summary' ? '#eff6ff' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              요약
            </button>
            <button
              onClick={() => scrollToSection('details')}
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              style={{
                padding: '16px 32px',
                fontSize: '14px',
                fontWeight: '500',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'details' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'details' ? '#2563eb' : '#6b7280',
                backgroundColor: activeTab === 'details' ? '#eff6ff' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              업무내용
            </button>
            <button
              onClick={() => scrollToSection('files')}
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'files'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              style={{
                padding: '16px 32px',
                fontSize: '14px',
                fontWeight: '500',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'files' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'files' ? '#2563eb' : '#6b7280',
                backgroundColor: activeTab === 'files' ? '#eff6ff' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              참고파일
            </button>
          </div>
        </div>

        {/* 요약 섹션 */}
        <div id="summary" className="bg-white rounded-xl shadow-sm mb-8 p-8" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '32px', padding: '32px' }}>
          <h2 className="text-xl font-bold mb-6 text-gray-900" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>프로젝트 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div className="bg-gray-50 p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <span className="text-gray-600 text-sm block mb-1" style={{ color: '#4b5563', fontSize: '14px', display: 'block', marginBottom: '4px' }}>예산</span>
              <span className="font-semibold text-gray-900 text-lg" style={{ fontWeight: '600', color: '#111827', fontSize: '18px' }}>{getBudgetTypeText(project.budgetType)}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <span className="text-gray-600 text-sm block mb-1" style={{ color: '#4b5563', fontSize: '14px', display: 'block', marginBottom: '4px' }}>선호파트너</span>
              <span className="font-semibold text-gray-900 text-lg" style={{ fontWeight: '600', color: '#111827', fontSize: '18px' }}>{getPartnerTypeText(project.partnerType)}</span>
            </div>
            {project.companyLocation && (
              <div className="bg-gray-50 p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <span className="text-gray-600 text-sm block mb-1" style={{ color: '#4b5563', fontSize: '14px', display: 'block', marginBottom: '4px' }}>지역</span>
                <span className="font-semibold text-gray-900 text-lg" style={{ fontWeight: '600', color: '#111827', fontSize: '18px' }}>{project.companyLocation}</span>
              </div>
            )}
            {project.startDate && project.endDate && (
              <div className="bg-gray-50 p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <span className="text-gray-600 text-sm block mb-1" style={{ color: '#4b5563', fontSize: '14px', display: 'block', marginBottom: '4px' }}>기간</span>
                <span className="font-semibold text-gray-900 text-lg" style={{ fontWeight: '600', color: '#111827', fontSize: '18px' }}>
                  {new Date(project.startDate).toLocaleDateString()} ~ {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          {/* 기술 스택 */}
          {project.techStacks?.length && (
            <div>
              <h3 className="font-semibold mb-4 text-gray-900" style={{ fontWeight: '600', marginBottom: '16px', color: '#111827' }}>기술 스택</h3>
              <div className="flex flex-wrap gap-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
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
                    <span key={category} className={`px-4 py-2 rounded-full text-sm font-medium ${
                      category === 'FRONTEND' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      category === 'BACKEND' ? 'bg-green-100 text-green-700 border border-green-200' :
                      category === 'DATABASE' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                      category === 'DESIGN' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`} style={{ 
                      padding: '8px 16px', 
                      borderRadius: '9999px', 
                      fontSize: '14px', 
                      fontWeight: '500'
                    }}>
                      {category === 'OTHER' ? techs.join(', ') : `${category}: ${techs.join(', ')}`}
                    </span>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* 업무내용 섹션 */}
        <div id="details" className="bg-white rounded-xl shadow-sm mb-8 p-8" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '32px', padding: '32px' }}>
          <h2 className="text-xl font-bold mb-6 text-gray-900" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>업무내용</h2>
          <div className="prose max-w-none" style={{ maxWidth: 'none' }}>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base" style={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: '1.7', fontSize: '16px' }}>
              {project.description || '업무 내용이 등록되지 않았습니다.'}
            </div>
          </div>
        </div>

        {/* 참고파일 섹션 */}
        <div id="files" className="bg-white rounded-xl shadow-sm mb-8 p-8" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '32px', padding: '32px' }}>
          <h2 className="text-xl font-bold mb-6 text-gray-900" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>참고파일</h2>
          {project.projectFiles?.length ? (
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {project.projectFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', transition: 'background-color 0.2s' }}>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl" style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '20px' }}>
                    📄
                  </div>
                  <div className="flex-1" style={{ flex: 1 }}>
                    <div className="font-semibold text-gray-900 mb-1" style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{file.originalName}</div>
                    <div className="text-sm text-gray-500" style={{ fontSize: '14px', color: '#6b7280' }}>
                      {formatFileSize(file.fileSize)}
                      {file.uploadDate && (
                        <span> • {new Date(file.uploadDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                    style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
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
            <div className="text-gray-500 text-center py-12" style={{ color: '#6b7280', textAlign: 'center', padding: '48px 0' }}>
              <div className="text-4xl mb-4" style={{ fontSize: '36px', marginBottom: '16px' }}>📁</div>
              <div className="text-lg" style={{ fontSize: '18px' }}>참고파일이 없습니다.</div>
            </div>
          )}
        </div>

        {/* 관리 버튼들 */}
        <div className="bg-white rounded-xl shadow-sm p-6" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '24px' }}>
          <div className="flex flex-col sm:flex-row gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => router.push(`/projects/${project.id}/edit`)}
              className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              style={{ 
                flex: 1,
                padding: '12px 0', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                fontWeight: '600', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: 'pointer', 
                transition: 'background-color 0.2s' 
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
            >
              프로젝트 수정
            </button>
            {project.status === 'RECRUITING' && (
              <button
                onClick={() => {
                  if (window.confirm('프로젝트 모집을 마감하시겠습니까?')) {
                    console.log('프로젝트 모집 마감:', project.id);
                  }
                }}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  fontWeight: '600', 
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  transition: 'background-color 0.2s' 
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444'}
              >
                모집마감
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProjectDetailPage;
