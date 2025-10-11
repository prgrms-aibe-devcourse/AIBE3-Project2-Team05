"use client";

import ProjectFileManager from '@/components/ProjectFileManager';
import { components } from '@/lib/backend/schema';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectResponse = components['schemas']['ProjectResponse'];
type ProjectRequest = components['schemas']['ProjectRequest'];
type ProjectFile = components['schemas']['ProjectFile'];
type ProjectFileInfo = components['schemas']['ProjectFileInfo'];

// 두 타입을 모두 지원하는 유니온 타입
type FileItem = ProjectFile | ProjectFileInfo;

interface FormData {
  title: string;
  description: string;
  budgetType: string;
  companyLocation: string;
  techNames: string[];
  startDate: string;
  endDate: string;
  projectField: string;
  recruitmentType: string;
  partnerType: string;
  progressStatus: string;
  budgetAmount?: number;
  partnerEtcDescription?: string;
}

const UserProjectEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  // ProjectFileManager를 위한 별도 파일 상태 추가 (ProjectResponse의 projectFiles는 ProjectFileInfo[] 타입)
  const [projectFiles, setProjectFiles] = useState<FileItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    budgetType: '',
    companyLocation: '',
    techNames: [],
    startDate: '',
    endDate: '',
    projectField: '',
    recruitmentType: '',
    partnerType: '',
    progressStatus: '',
    budgetAmount: undefined,
    partnerEtcDescription: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!params?.projectId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${params.projectId}`);
        if (response.ok) {        const data: ProjectResponse = await response.json();
        setProject(data);
        
        // 디버깅 로그 추가
        console.log('프로젝트 데이터 구조 확인:', data);
        console.log('기술 스택 데이터:', data.techStacks);
        console.log('파일 데이터:', data.projectFiles);
        
        // ProjectFileManager를 위한 파일 상태 초기화
        setProjectFiles(data.projectFiles || []);
        
        // 폼 데이터 초기화
        setFormData({
            title: data.title || '',
            description: data.description || '',
            budgetType: data.budgetType || '',
            companyLocation: data.companyLocation || '',
            techNames: data.techStacks?.map(tech => tech.techName || '') || [],
            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
            projectField: data.projectField || '',
            recruitmentType: data.recruitmentType || '',
            partnerType: data.partnerType || '',
            progressStatus: data.progressStatus || '',
            budgetAmount: data.budgetAmount,
            partnerEtcDescription: data.partnerEtcDescription || ''
          });
          
          console.log('초기화된 기술 스택:', data.techStacks?.map(tech => tech.techName || ''));
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

  const handleInputChange = (field: keyof FormData, value: string | string[] | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTechStackChange = (techStack: string) => {
    setFormData(prev => {
      const currentTechStacks = prev.techNames || [];
      const isSelected = currentTechStacks.includes(techStack);
      
      return {
        ...prev,
        techNames: isSelected 
          ? currentTechStacks.filter(ts => ts !== techStack)
          : [...currentTechStacks, techStack]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      // 필수 필드 검증
      if (!formData.title?.trim()) {
        alert('프로젝트 제목을 입력해주세요.');
        return;
      }
      if (!formData.description?.trim()) {
        alert('프로젝트 설명을 입력해주세요.');
        return;
      }
      if (!formData.projectField) {
        alert('프로젝트 분야를 선택해주세요.');
        return;
      }
      if (!formData.recruitmentType) {
        alert('모집 유형을 선택해주세요.');
        return;
      }
      if (!formData.budgetType) {
        alert('예산 유형을 선택해주세요.');
        return;
      }
      if (!formData.startDate) {
        alert('시작 날짜를 입력해주세요.');
        return;
      }
      if (!formData.endDate) {
        alert('종료 날짜를 입력해주세요.');
        return;
      }
      if (!params.managerId) {
        alert('관리자 ID가 필요합니다.');
        return;
      }

      const requestData: ProjectRequest = {
        title: formData.title,
        description: formData.description,
        projectField: formData.projectField as ProjectRequest['projectField'],
        recruitmentType: formData.recruitmentType as ProjectRequest['recruitmentType'],
        budgetType: formData.budgetType as ProjectRequest['budgetType'],
        startDate: formData.startDate,
        endDate: formData.endDate,
        managerId: parseInt(params.managerId as string),
        companyLocation: formData.companyLocation as ProjectRequest['companyLocation'],
        techNames: formData.techNames,
        partnerType: formData.partnerType as ProjectRequest['partnerType'],
        progressStatus: formData.progressStatus as ProjectRequest['progressStatus'],
        budgetAmount: formData.budgetAmount,
        partnerEtcDescription: formData.partnerEtcDescription
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${params.projectId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        // 수정된 프로젝트 데이터를 다시 불러와서 최신 상태로 업데이트
        const updatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${params.projectId}?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (updatedResponse.ok) {
          const updatedData: ProjectResponse = await updatedResponse.json();
          
          // 현재 메모리의 파일 상태와 API 응답 중 더 최신인 것을 사용
          const finalFiles = (projectFiles && projectFiles.length > 0) 
            ? projectFiles  // 메모리에 파일이 있다면 메모리 상태 우선 사용
            : (updatedData.projectFiles || []); // 메모리에 없다면 API 응답 사용
          
          setProject({
            ...updatedData,
            projectFiles: finalFiles  // 최종 파일 목록으로 설정
          });
          setProjectFiles(finalFiles);
        }
        
        alert('프로젝트가 수정되었습니다.');
        
        // 브라우저의 세션 스토리지에 업데이트 플래그 설정 (프로젝트별, TTL 포함)
        const projectUpdateKey = `projectUpdated_${params.projectId}`;
        const projectUpdateTimeKey = `projectUpdateTime_${params.projectId}`;
        const projectFilesKey = `projectFiles_${params.projectId}`;
        const projectFilesTimeKey = `projectFilesTime_${params.projectId}`;
        
        sessionStorage.setItem(projectUpdateKey, 'true');
        sessionStorage.setItem(projectUpdateTimeKey, Date.now().toString());
        
        // 현재 메모리의 파일 상태를 세션 스토리지에 저장 (TTL 포함)
        if (projectFiles && projectFiles.length > 0) {
          sessionStorage.setItem(projectFilesKey, JSON.stringify(projectFiles));
          sessionStorage.setItem(projectFilesTimeKey, Date.now().toString());
        } else {
          sessionStorage.removeItem(projectFilesKey);
          sessionStorage.removeItem(projectFilesTimeKey);
        }
        
        // 완전한 페이지 새로고침으로 캐시 문제 방지
        window.location.href = `/user-projects/${params.managerId}/${params.projectId}`;
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || '프로젝트 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
      alert('프로젝트 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // ProjectFileManager를 위한 파일 변경 핸들러 수정
  const handleFilesChange = (updatedFiles: FileItem[]) => {
    setProjectFiles(updatedFiles);
    
    // 프로젝트 상태도 동시에 업데이트
    if (project) {
      setProject({
        ...project,
        projectFiles: updatedFiles
      });
    }
  };

  // 예산 타입 옵션
  const budgetOptions = [
    { value: 'RANGE_1_100', label: '1만원 ~ 100만원' },
    { value: 'RANGE_100_200', label: '100만원 ~ 200만원' },
    { value: 'RANGE_200_300', label: '200만원 ~ 300만원' },
    { value: 'RANGE_300_500', label: '300만원 ~ 500만원' },
    { value: 'RANGE_500_1000', label: '500만원 ~ 1000만원' },
    { value: 'RANGE_1000_2000', label: '1000만원 ~ 2000만원' },
    { value: 'RANGE_2000_3000', label: '2000만원 ~ 3000만원' },
    { value: 'RANGE_3000_5000', label: '3000만원 ~ 5000만원' },
    { value: 'RANGE_5000_OVER', label: '5000만원 이상' },
    { value: 'OVER_1_EUK', label: '1억원 이상' },
    { value: 'NEGOTIABLE', label: '협의' }
  ];

  // 지역 옵션
  const regionOptions = [
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

  // 기술 스택 옵션 (카테고리별)
  const techStackCategories = {
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
      { value: 'SQLITE', label: 'SQLite' },
      { value: 'MARIADB', label: 'MariaDB' },
      { value: 'ELASTICSEARCH', label: 'Elasticsearch' },
      { value: 'FIREBASE', label: 'Firebase' }
    ]
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
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div className="max-w-3xl mx-auto p-6" style={{ maxWidth: '48rem', margin: '0 auto', padding: '24px' }}>
        {/* 헤더 */}
        <div className="mb-8" style={{ marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            <button onClick={() => router.push(`/user-projects/${params.managerId}`)} className="hover:text-blue-600" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              내 프로젝트
            </button>
            <span>›</span>
            <button onClick={() => router.push(`/user-projects/${params.managerId}/${params.projectId}`)} className="hover:text-blue-600" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              {project.title}
            </button>
            <span>›</span>
            <span className="text-gray-700" style={{ color: '#374151' }}>수정</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '30px', fontWeight: '700', color: '#111827' }}>프로젝트 수정</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div className="p-8 space-y-6" style={{ padding: '32px' }}>
            {/* 프로젝트 제목 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                프로젝트 제목 *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                placeholder="프로젝트 제목을 입력하세요"
                required
              />
            </div>

            {/* 프로젝트 설명 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                프로젝트 설명
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '100px' }}
                placeholder="프로젝트에 대한 설명을 입력하세요"
              />
            </div>

            {/* 예산 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                예산
              </label>
              <select
                value={formData.budgetType || ''}
                onChange={(e) => handleInputChange('budgetType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="">예산을 선택하세요</option>
                {budgetOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                지역
              </label>
              <select
                value={formData.companyLocation || ''}
                onChange={(e) => handleInputChange('companyLocation', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="">지역을 선택하세요</option>
                {regionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 기술 스택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                기술 스택
              </label>
              <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(techStackCategories).map(([category, techs]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2" style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>
                      {category}
                    </h4>
                    <div className="grid grid-cols-4 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {techs.map(tech => (
                        <label key={tech.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          backgroundColor: formData.techNames?.includes(tech.value) ? '#eff6ff' : 'white',
                          borderColor: formData.techNames?.includes(tech.value) ? '#3b82f6' : '#d1d5db'
                        }}>
                          <input
                            type="checkbox"
                            checked={formData.techNames?.includes(tech.value) || false}
                            onChange={() => handleTechStackChange(tech.value)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium" style={{ fontSize: '14px', fontWeight: '500', color: formData.techNames?.includes(tech.value) ? '#1d4ed8' : '#374151' }}>
                            {tech.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 프로젝트 분야 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                프로젝트 분야
              </label>
              <select
                value={formData.projectField || ''}
                onChange={(e) => handleInputChange('projectField', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="">프로젝트 분야를 선택하세요</option>
                <option value="PLANNING">기획</option>
                <option value="DESIGN">디자인</option>
                <option value="DEVELOPMENT">개발</option>
              </select>
            </div>

            {/* 모집 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                모집 유형
              </label>
              <select
                value={formData.recruitmentType || ''}
                onChange={(e) => handleInputChange('recruitmentType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="">모집 유형을 선택하세요</option>
                <option value="PROJECT_CONTRACT">프로젝트 단위 계약(외주)</option>
                <option value="PERSONAL_CONTRACT">개인 인력의 기간/시간제 계약(상주)</option>
              </select>
            </div>

            {/* 파트너 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                파트너 유형
              </label>
              <select
                value={formData.partnerType || ''}
                onChange={(e) => handleInputChange('partnerType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="">파트너 유형을 선택하세요</option>
                <option value="INDIVIDUAL_FREELANCER">개인 프리랜서를 선호합니다</option>
                <option value="INDIVIDUAL_OR_TEAM_FREELANCER">개인 또는 팀 프리랜서 선호합니다</option>
                <option value="BUSINESS_TEAM_OR_COMPANY">사업자가 있는 팀단위 또는 기업을 선호합니다</option>
                <option value="ANY_TYPE">어떤 형태든 무관합니다</option>
                <option value="ETC">기타</option>
              </select>
            </div>

            {/* 진행 상태 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                프로젝트 진행 상태
              </label>
              <select
                value={formData.progressStatus || ''}
                onChange={(e) => handleInputChange('progressStatus', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="">진행 상태를 선택하세요</option>
                <option value="IDEA_STAGE">아이디어 구상 단계에요.</option>
                <option value="CONTENT_ORGANIZED">필요한 내용이 정리되었어요.</option>
                <option value="DETAILED_PLAN">상세 기획서가 있어요.</option>
              </select>
            </div>

            {/* 프로젝트 시작일 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                프로젝트 시작일
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
            </div>

            {/* 프로젝트 종료일 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                프로젝트 종료일
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
            </div>

            {/* 첨부파일 */}
            <div>
              <ProjectFileManager
                projectId={params?.projectId as string}
                projectFiles={projectFiles}
                onFilesChange={handleFilesChange}
                disabled={saving}
                mode="edit"
              />
            </div>

          </div>

          {/* 하단 버튼들 */}
          <div className="px-8 py-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex gap-4" style={{ 
            padding: '24px 32px', 
            backgroundColor: '#f9fafb', 
            borderTopLeftRadius: '0', 
            borderTopRightRadius: '0', 
            borderBottomLeftRadius: '12px', 
            borderBottomRightRadius: '12px', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '16px'
          }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              style={{ 
                flex: 1,
                padding: '12px 0', 
                backgroundColor: '#e5e7eb', 
                color: '#374151', 
                fontWeight: '600', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: 'pointer', 
                transition: 'background-color 0.2s' 
              }}
              disabled={saving}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                flex: 1,
                padding: '12px 0', 
                backgroundColor: saving ? '#9ca3af' : '#3b82f6', 
                color: 'white', 
                fontWeight: '600', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: saving ? 'not-allowed' : 'pointer', 
                transition: 'background-color 0.2s',
                opacity: saving ? 0.5 : 1
              }}
            >
              {saving ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProjectEditPage;
