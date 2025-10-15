"use client";

import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProjectFileManager from '@/components/ProjectFileManager';
import {
  budgetOptions,
  partnerTypeOptions,
  progressStatusOptions,
  projectFieldOptions,
  recruitmentTypeOptions,
  regionOptions,
  techStackCategories
} from '@/constants/projectOptions';
import { components } from '@/lib/backend/schema';
import { formClasses, formStyles } from '@/styles/formStyles';
import { showErrorMessage, showSuccessMessage, showValidationError, validateProjectForm } from '@/utils/formValidation';
import { formatDateForInput } from '@/utils/projectUtils';
import { sessionStorageUtils } from '@/utils/sessionStorageUtils';
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
        const url = sessionStorageUtils.addCacheBuster(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${params.projectId}`);
        const response = await fetch(url, {
          cache: 'no-store',
          credentials: 'include',
          headers: sessionStorageUtils.getCacheBustingHeaders()
        });
        
        if (response.ok) {
          const data: ProjectResponse = await response.json();
          
          // 디버깅 로그 추가
          console.log('프로젝트 데이터 구조 확인:', data);
          console.log('기술 스택 데이터:', data.techStacks);
          console.log('파일 데이터:', data.projectFiles);
          
          // 서버 응답의 파일 데이터를 사용 (세션 스토리지 의존성 제거)
          const finalFiles: FileItem[] = data.projectFiles || [];
          console.log('API 응답 파일 사용:', finalFiles);
          
          setProject({
            ...data,
            projectFiles: finalFiles
          });
          
          // ProjectFileManager를 위한 파일 상태 초기화
          setProjectFiles(finalFiles);
          console.log('최종 설정된 파일:', finalFiles);
        
        // 폼 데이터 초기화
        setFormData({
            title: data.title || '',
            description: data.description || '',
            budgetType: data.budgetType || '',
            companyLocation: data.companyLocation || '',
            techNames: data.techStacks?.map(tech => tech.techName || '') || [],
            startDate: formatDateForInput(data.startDate),
            endDate: formatDateForInput(data.endDate),
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
      const validationError = validateProjectForm(formData, params.managerId as string);
      if (validationError) {
        showValidationError(validationError);
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
        // 빈 문자열을 null로 변환하여 백엔드 에러 방지
        companyLocation: formData.companyLocation && formData.companyLocation.trim() 
          ? formData.companyLocation as ProjectRequest['companyLocation'] 
          : undefined,
        techNames: formData.techNames && formData.techNames.length > 0 ? formData.techNames : undefined,
        partnerType: formData.partnerType && formData.partnerType.trim() 
          ? formData.partnerType as ProjectRequest['partnerType'] 
          : undefined,
        progressStatus: formData.progressStatus && formData.progressStatus.trim() 
          ? formData.progressStatus as ProjectRequest['progressStatus'] 
          : undefined,
        budgetAmount: formData.budgetAmount || undefined,
        partnerEtcDescription: formData.partnerEtcDescription && formData.partnerEtcDescription.trim() 
          ? formData.partnerEtcDescription 
          : undefined
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${params.projectId}/complete`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        // 수정된 프로젝트 데이터를 다시 불러와서 최신 상태로 업데이트
        const updatedUrl = sessionStorageUtils.addCacheBuster(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${params.projectId}`);
        const updatedResponse = await fetch(updatedUrl, {
          cache: 'no-store',
          credentials: 'include',
          headers: sessionStorageUtils.getCacheBustingHeaders()
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
        
        showSuccessMessage('프로젝트가 수정되었습니다.');
        
        // 완전한 페이지 새로고침으로 캐시 문제 방지
        window.location.href = `/user-projects/${params.managerId}/${params.projectId}`;
      } else {
        const errorData = await response.json().catch(() => ({}));
        showErrorMessage(errorData.msg || '프로젝트 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
      showErrorMessage('프로젝트 수정 중 오류가 발생했습니다.');
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



  if (loading) {
    return <LoadingSpinner message="프로젝트를 불러오는 중..." />;
  }

  if (error || !project) {
    return <ErrorDisplay error={error || '프로젝트를 찾을 수 없습니다.'} onRetry={() => router.back()} retryButtonText="돌아가기" />;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-3xl mx-auto p-6" style={formStyles.contentContainer}>
        {/* 헤더 */}
        <div className="mb-8" style={formStyles.headerContainer}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4" style={formStyles.breadcrumbContainer}>
            <button onClick={() => router.push(`/user-projects/${params.managerId}`)} className="hover:text-blue-600" style={formStyles.breadcrumbButton}>
              내 프로젝트
            </button>
            <span>›</span>
            <button onClick={() => router.push(`/user-projects/${params.managerId}/${params.projectId}`)} className="hover:text-blue-600" style={formStyles.breadcrumbButton}>
              {project.title}
            </button>
            <span>›</span>
            <span className="text-gray-700" style={{ color: '#374151' }}>수정</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={formStyles.pageTitle}>프로젝트 수정</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm" style={formStyles.formContainer}>
          <div className="p-8 space-y-6" style={formStyles.formContent}>
            {/* 프로젝트 제목 */}
            <div>
              <label className={formClasses.label} style={formStyles.label}>
                프로젝트 제목 *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={formClasses.input}
                style={formStyles.input}
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
                {projectFieldOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                {recruitmentTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                {partnerTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                {progressStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                참고파일 관리
                <span className="text-xs text-gray-500 font-normal ml-2" style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400', marginLeft: '8px' }}>
                  (드래그 앤 드롭 또는 클릭하여 파일을 추가/삭제할 수 있습니다)
                </span>
              </label>
              <div className="bg-gray-50 p-4 rounded-lg" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <ProjectFileManager
                  projectId={params?.projectId as string}
                  projectFiles={projectFiles}
                  onFilesChange={handleFilesChange}
                  disabled={saving}
                  mode="edit"
                />
              </div>
            </div>

          </div>

          {/* 하단 버튼들 */}
          <div className="px-8 py-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex gap-4" style={formStyles.buttonContainer}>
            <button
              type="button"
              onClick={() => router.back()}
              className={formClasses.cancelButton}
              style={formStyles.cancelButton(saving)}
              disabled={saving}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className={formClasses.submitButton}
              style={formStyles.submitButton(saving)}
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
