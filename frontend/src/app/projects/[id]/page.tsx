"use client";

import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import { components } from '@/lib/backend/schema';
import {
  canPreviewFile,
  getFileIcon,
  handleFileDownload,
  handleFilePreview
} from '@/utils/filePreviewUtils';
import {
  calculateDday,
  formatFileSize,
  getBudgetTypeText,
  getLocationText,
  getPartnerTypeText,
  getProgressStatusText,
  getProjectFieldText,
  getRecruitmentTypeText,
  getStatusText,
  getTechCategoryFromName,
  getTechStackText
} from '@/utils/projectUtils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectResponse = components['schemas']['ProjectResponse'];
type ProjectFile = {
  id: number;
  originalName: string;
  fileSize: number;
  uploadDate?: string;
};

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('summary');
  const [alternativeFiles, setAlternativeFiles] = useState<ProjectFile[]>([]);

  // 별도 파일 API 호출 함수
  const fetchAlternativeFiles = async (projectId: string): Promise<ProjectFile[]> => {
    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const responseText = await response.text();
        
        // 빈 응답 체크
        if (!responseText || responseText.trim() === '') {
          return [];
        }
        
        try {
          const files = JSON.parse(responseText);
          return Array.isArray(files) ? files : [];
        } catch (parseError) {
          console.error('파일 API JSON 파싱 실패:', parseError);
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error('파일 API 오류:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!params?.id) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${params.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const responseText = await response.text();
          
          let data: ProjectResponse;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON 파싱 실패:', parseError);
            throw new Error('서버 응답을 처리할 수 없습니다.');
          }
          
          setProject(data);
          
          // 즐겨찾기 기능은 프로젝트 목록 페이지에서만 제공
          
          // 대안 파일 로딩 로직
          let altFiles: ProjectFile[] = [];
          const hasProjectFiles = data.projectFiles && Array.isArray(data.projectFiles) && data.projectFiles.length > 0;
          
          if (!hasProjectFiles) {
            altFiles = await fetchAlternativeFiles(params.id as string);
          }
          
          setAlternativeFiles(altFiles);
          
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



  if (loading) {
    return <LoadingSpinner message="프로젝트를 불러오는 중..." />;
  }

  if (error || !project) {
    return (
      <ErrorDisplay 
        error={error || '프로젝트를 찾을 수 없습니다.'} 
        onRetry={() => router.back()}
        retryButtonText="뒤로가기"
      />
    );
  }

  // 탭 네비게이션을 위한 스크롤 함수
  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      // 헤더나 탭 네비게이션 높이를 고려한 오프셋 (필요에 따라 조정)
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };



  // 통합 파일 목록 가져오기
  const getDisplayFiles = () => {
    const projectFiles = project?.projectFiles || [];
    const hasProjectFiles = Array.isArray(projectFiles) && projectFiles.length > 0;
    
    if (hasProjectFiles) {
      return projectFiles.filter((file): file is Required<ProjectFile> => 
        file.id !== undefined && file.originalName !== undefined && file.fileSize !== undefined
      );
    } else {
      return alternativeFiles;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-3xl mx-auto p-6" style={{ maxWidth: '48rem', margin: '0 auto', padding: '24px' }}>
        {/* 프로젝트 목록으로 돌아가기 */}
        <div className="mb-6" style={{ marginBottom: '24px' }}>
          <button
            onClick={() => router.push('/projects')}
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
            ← 프로젝트 목록으로
          </button>
        </div>

        {/* 상단 프로젝트 기본 정보 */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '32px', overflow: 'hidden' }}>
          <div className="p-8 border-b border-gray-100" style={{ padding: '32px', borderBottom: '1px solid #f3f4f6' }}>
            <div className="flex justify-between items-start mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div className="flex items-center gap-3 flex-1 mr-4" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, marginRight: '16px' }}>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
                  {project.title}
                </h1>

              </div>
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
                <span className="font-semibold text-gray-900 text-lg" style={{ fontWeight: '600', color: '#111827', fontSize: '18px' }}>{getLocationText(project.companyLocation)}</span>
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
          {getDisplayFiles().length ? (
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getDisplayFiles().map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', transition: 'background-color 0.2s' }}>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl" style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {getFileIcon(file.originalName)}
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
                  <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                    {canPreviewFile(file.originalName) && (
                      <button
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                        style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                        onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                        onClick={() => handleFilePreview(project?.id?.toString() || '', file.id)}
                      >
                        미리보기
                      </button>
                    )}
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                      style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                      onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
                      onClick={() => handleFileDownload(project?.id?.toString() || '', file.id, file.originalName)}
                    >
                      다운로드
                    </button>
                  </div>
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
      </div>
    </div>
  );
};

export default ProjectDetailPage;
