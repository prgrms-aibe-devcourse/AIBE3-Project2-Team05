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
import { formatDateForInput, getBudgetAmountFromType } from '@/utils/projectUtils';
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
            // budgetAmount가 없으면 budgetType으로부터 자동 생성
            budgetAmount: data.budgetAmount ?? getBudgetAmountFromType(data.budgetType),
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
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      
      // budgetType이 변경되면 자동으로 budgetAmount 설정
      if (field === 'budgetType' && typeof value === 'string') {
        newFormData.budgetAmount = getBudgetAmountFromType(value);
      }
      
      return newFormData;
    });
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
        budgetAmount: formData.budgetAmount !== undefined ? formData.budgetAmount : undefined,
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
        showErrorMessage(errorData.message || '프로젝트 수정에 실패했습니다.');
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

  // 프로젝트 상태에 따한 필드 제한 로직
  const getFieldRestrictions = () => {
    if (!project) return { isRestrictedField: () => false, isFullyRestricted: false };

    const isFullyRestricted = project.status === 'IN_PROGRESS' || project.status === 'COMPLETED';
    const isPartialRestricted = project.status === 'CONTRACTING';

    // 계약중인 경우 제한되는 필수 정보 필드들
    const restrictedFields = ['title', 'description', 'projectField', 'recruitmentType', 'budgetType', 'startDate', 'endDate'];

    const isRestrictedField = (fieldName: string) => {
      if (isFullyRestricted) return true; // 진행중이거나 완료된 경우 모든 필드 제한
      if (isPartialRestricted && restrictedFields.includes(fieldName)) return true; // 계약중인 경우 필수 정보만 제한
      return false;
    };

    return { isRestrictedField, isFullyRestricted, isPartialRestricted };
  };

  const { isRestrictedField, isFullyRestricted, isPartialRestricted } = getFieldRestrictions();

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

          {/* 상태에 따른 제한 알림 - 완료 상태는 제외 */}
          {(isPartialRestricted || (isFullyRestricted && project.status === 'IN_PROGRESS')) && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 ${
              isFullyRestricted
                ? 'bg-red-50 border-red-400'
                : 'bg-orange-50 border-orange-400'
            }`} style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '8px',
              borderLeftWidth: '4px',
              backgroundColor: isFullyRestricted ? '#fef2f2' : '#fff7ed',
              borderLeftColor: isFullyRestricted ? '#f87171' : '#fb923c'
            }}>
              <div className={`flex items-center ${
                isFullyRestricted ? 'text-red-800' : 'text-orange-800'
              }`} style={{
                display: 'flex',
                alignItems: 'center',
                color: isFullyRestricted ? '#991b1b' : '#9a3412'
              }}>
                <span className="text-lg mr-3" style={{ fontSize: '18px', marginRight: '12px' }}>
                  {isFullyRestricted ? '⚠️' : '📝'}
                </span>
                <div>
                  <p className="font-semibold" style={{ fontWeight: '600' }}>
                    {isFullyRestricted
                      ? '진행중인 프로젝트는 수정이 제한됩니다'
                      : '계약중인 프로젝트는 필수 정보 수정이 제한됩니다'
                    }
                  </p>
                  <p className={`text-sm mt-1 ${
                    isFullyRestricted ? 'text-red-700' : 'text-orange-700'
                  }`} style={{
                    fontSize: '14px',
                    marginTop: '4px',
                    color: isFullyRestricted ? '#b91c1c' : '#c2410c'
                  }}>
                    {isFullyRestricted
                      ? '상태 변경 외에 모든 정보의 수정이 불가능합니다.'
                      : '제목, 설명, 프로젝트 분야, 모집 형태, 예산, 기간은 수정할 수 없습니다.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm" style={formStyles.formContainer}>
          <div className="p-8 space-y-6" style={formStyles.formContent}>
            {/* 프로젝트 제목 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                📝 프로젝트 제목 *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  backgroundColor: isRestrictedField('title') ? '#f3f4f6' : '#fefefe',
                  color: isRestrictedField('title') ? '#6b7280' : '#111827',
                  cursor: isRestrictedField('title') ? 'not-allowed' : 'text',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                placeholder="프로젝트 제목을 입력하세요"
                required
                disabled={isRestrictedField('title')}
                title={isRestrictedField('title') ? '이 필드는 현재 상태에서 수정할 수 없습니다' : undefined}
              />
            </div>

            {/* 프로젝트 설명 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                📄 프로젝트 설명
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm resize-none"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  minHeight: '120px',
                  fontSize: '16px',
                  fontWeight: '400',
                  lineHeight: '1.6',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  backgroundColor: isRestrictedField('description') ? '#f3f4f6' : '#fefefe',
                  color: isRestrictedField('description') ? '#6b7280' : '#111827',
                  cursor: isRestrictedField('description') ? 'not-allowed' : 'text',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                  resize: 'none'
                }}
                placeholder="프로젝트에 대한 상세한 설명을 입력해주세요..."
                disabled={isRestrictedField('description')}
                title={isRestrictedField('description') ? '이 필드는 현재 상태에서 수정할 수 없습니다' : undefined}
              />
            </div>

            {/* 예산 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                💰 예산 범위
              </label>
              <select
                value={formData.budgetType || ''}
                onChange={(e) => handleInputChange('budgetType', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm bg-white"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  backgroundColor: isRestrictedField('budgetType') ? '#f3f4f6' : '#ffffff',
                  color: isRestrictedField('budgetType') ? '#6b7280' : '#111827',
                  cursor: isRestrictedField('budgetType') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                disabled={isRestrictedField('budgetType')}
                title={isRestrictedField('budgetType') ? '이 필드는 현재 상태에서 수정할 수 없습니다' : undefined}
              >
                <option value="" style={{ color: '#9ca3af' }}>💼 예산 범위를 선택해주세요</option>
                {budgetOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ color: '#1f2937', fontWeight: '500' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                📍 프로젝트 지역
              </label>
              <select
                value={formData.companyLocation || ''}
                onChange={(e) => handleInputChange('companyLocation', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm bg-white"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  backgroundColor: isRestrictedField('companyLocation') ? '#f3f4f6' : '#ffffff',
                  color: isRestrictedField('companyLocation') ? '#6b7280' : '#111827',
                  cursor: isRestrictedField('companyLocation') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                disabled={isRestrictedField('companyLocation')}
              >
                <option value="" style={{ color: '#9ca3af' }}>🌍 진행 지역을 선택해주세요</option>
                {regionOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ color: '#1f2937', fontWeight: '500' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 기술 스택 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                ⚡ 기술 스택
              </label>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200" style={{
                backgroundColor: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {Object.entries(techStackCategories).map(([category, techs]) => (
                    <div key={category}>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center" style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#374151',
                        marginBottom: '12px',
                        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {category}
                      </h4>
                      <div className="grid grid-cols-4 gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {techs.map(tech => (
                          <label key={tech.value} className="flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 transform" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '14px 8px',
                            border: '2px solid',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            backgroundColor: formData.techNames?.includes(tech.value) ? '#dbeafe' : '#ffffff',
                            borderColor: formData.techNames?.includes(tech.value) ? '#3b82f6' : '#e5e7eb',
                            boxShadow: formData.techNames?.includes(tech.value) ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
                            transform: formData.techNames?.includes(tech.value) ? 'translateY(-1px)' : 'translateY(0)'
                          }}>
                            <input
                              type="checkbox"
                              checked={formData.techNames?.includes(tech.value) || false}
                              onChange={() => handleTechStackChange(tech.value)}
                              className="sr-only"
                            />
                            <span className="text-sm font-semibold text-center" style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: formData.techNames?.includes(tech.value) ? '#1e40af' : '#4b5563',
                              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              textAlign: 'center'
                            }}>
                              {tech.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 프로젝트 분야 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                🎯 프로젝트 분야
              </label>
              <select
                value={formData.projectField || ''}
                onChange={(e) => handleInputChange('projectField', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm bg-white"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  backgroundColor: isRestrictedField('projectField') ? '#f3f4f6' : '#ffffff',
                  color: isRestrictedField('projectField') ? '#6b7280' : '#111827',
                  cursor: isRestrictedField('projectField') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                disabled={isRestrictedField('projectField')}
                title={isRestrictedField('projectField') ? '이 필드는 현재 상태에서 수정할 수 없습니다' : undefined}
              >
                <option value="" style={{ color: '#9ca3af' }}>🚀 프로젝트 분야를 선택해주세요</option>
                {projectFieldOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ color: '#1f2937', fontWeight: '500' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 모집 유형 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                👥 모집 유형
              </label>
              <select
                value={formData.recruitmentType || ''}
                onChange={(e) => handleInputChange('recruitmentType', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm bg-white"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  backgroundColor: isRestrictedField('recruitmentType') ? '#f3f4f6' : '#ffffff',
                  color: isRestrictedField('recruitmentType') ? '#6b7280' : '#111827',
                  cursor: isRestrictedField('recruitmentType') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                disabled={isRestrictedField('recruitmentType')}
                title={isRestrictedField('recruitmentType') ? '이 필드는 현재 상태에서 수정할 수 없습니다' : undefined}
              >
                <option value="" style={{ color: '#9ca3af' }}>📋 모집 유형을 선택해주세요</option>
                {recruitmentTypeOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ color: '#1f2937', fontWeight: '500' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 파트너 유형 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                🤝 파트너 유형
              </label>
              <select
                value={formData.partnerType || ''}
                onChange={(e) => handleInputChange('partnerType', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm bg-white"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  backgroundColor: isRestrictedField('partnerType') ? '#f3f4f6' : '#ffffff',
                  color: isRestrictedField('partnerType') ? '#6b7280' : '#111827',
                  cursor: isRestrictedField('partnerType') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                disabled={isRestrictedField('partnerType')}
              >
                <option value="" style={{ color: '#9ca3af' }}>🔍 파트너 유형을 선택해주세요</option>
                {partnerTypeOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ color: '#1f2937', fontWeight: '500' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 진행 상태 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                📊 프로젝트 진행 상태
              </label>
              <select
                value={formData.progressStatus || ''}
                onChange={(e) => handleInputChange('progressStatus', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm bg-white"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  backgroundColor: isRestrictedField('progressStatus') ? '#f3f4f6' : '#ffffff',
                  color: isRestrictedField('progressStatus') ? '#6b7280' : '#111827',
                  cursor: isRestrictedField('progressStatus') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                disabled={isRestrictedField('progressStatus')}
              >
                <option value="" style={{ color: '#9ca3af' }}>⏳ 진행 상태를 선택해주세요</option>
                {progressStatusOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ color: '#1f2937', fontWeight: '500' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 프로젝트 기간 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 프로젝트 시작일 */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '8px',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}>
                  🗓️ 프로젝트 시작일
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-green-300 focus:border-green-500 transition-all duration-200 shadow-sm"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    backgroundColor: isRestrictedField('startDate') ? '#f3f4f6' : '#fefefe',
                    color: isRestrictedField('startDate') ? '#6b7280' : '#111827',
                    cursor: isRestrictedField('startDate') ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                  }}
                  disabled={isRestrictedField('startDate')}
                  title={isRestrictedField('startDate') ? '이 필드는 현재 상태에서 수정할 수 없습니다' : undefined}
                />
              </div>

              {/* 프로젝트 종료일 */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '8px',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}>
                  🏁 프로젝트 종료일
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-300 focus:border-red-500 transition-all duration-200 shadow-sm"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    backgroundColor: isRestrictedField('endDate') ? '#f3f4f6' : '#fefefe',
                    color: isRestrictedField('endDate') ? '#6b7280' : '#111827',
                    cursor: isRestrictedField('endDate') ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                  }}
                  disabled={isRestrictedField('endDate')}
                  title={isRestrictedField('endDate') ? '이 필드는 현재 상태에서 수정할 수 없습니다' : undefined}
                />
              </div>
            </div>

            {/* 첨부파일 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2" style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                📎 참고파일 관리
                <span className="block text-xs text-gray-600 font-normal mt-1" style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '400',
                  marginTop: '4px',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}>
                  💡 드래그 앤 드롭 또는 클릭하여 파일을 자유롭게 추가/삭제할 수 있습니다
                </span>
              </label>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-dashed border-blue-200" style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                padding: '24px',
                borderRadius: '12px',
                border: '2px dashed #bfdbfe',
                transition: 'all 0.2s ease-in-out'
              }}>
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
              disabled={saving || isFullyRestricted}
              className={formClasses.submitButton}
              style={{
                ...formStyles.submitButton(saving || isFullyRestricted),
                opacity: isFullyRestricted ? 0.5 : (saving ? 0.7 : 1),
                cursor: isFullyRestricted ? 'not-allowed' : (saving ? 'not-allowed' : 'pointer')
              }}
              title={
                isFullyRestricted
                  ? (project.status === 'IN_PROGRESS'
                      ? '진행중인 프로젝트는 수정할 수 없습니다'
                      : '완료된 프로젝트는 수정할 수 없습니다'
                    )
                  : undefined
              }
              onClick={(e) => {
                if (isFullyRestricted) {
                  e.preventDefault();
                  if (project.status === 'IN_PROGRESS') {
                    alert('진행중인 프로젝트는 수정할 수 없습니다.');
                  } else if (project.status === 'COMPLETED') {
                    alert('완료된 프로젝트는 수정할 수 없습니다.');
                  }
                }
              }}
            >
              {saving ? '저장 중...' : isFullyRestricted ? '수정 제한됨' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProjectEditPage;
