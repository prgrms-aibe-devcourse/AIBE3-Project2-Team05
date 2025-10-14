"use client";

import { useUser } from '@/app/context/UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { budgetOptions, partnerTypeOptions, progressStatusOptions, regionOptions, techStackCategories } from '@/constants/projectOptions';
import { components } from '@/lib/backend/schema';
import { sessionStorageUtils } from '@/utils/sessionStorageUtils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectRequest = components['schemas']['ProjectRequest'];
type ProjectFile = components['schemas']['ProjectFile'];
type ProjectFileInfo = components['schemas']['ProjectFileInfo'];

// 두 타입을 모두 지원하는 유니온 타입
type FileItem = ProjectFile | ProjectFileInfo;

interface BasicFormData {
  title: string;
  description: string;
  projectField: string;
  recruitmentType: string;
  budgetType: string;
  startDate: string;
  endDate: string;
}

interface AdditionalFormData {
  partnerType: string;
  progressStatus: string;
  companyLocation: string;
  techNames: string[];
}

const ProjectCreateAdditionalPage = () => {
  const router = useRouter();
  const { username, memberId, isLoaded } = useUser();
  const [basicData, setBasicData] = useState<BasicFormData | null>(null);
  const [additionalData, setAdditionalData] = useState<AdditionalFormData>({
    partnerType: '',
    progressStatus: '',
    companyLocation: '',
    techNames: []
  });
  const [projectFiles, setProjectFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // 실제 파일 객체 저장
  const [creating, setCreating] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // 페이지 접근 시 로그인 체크
  useEffect(() => {
    if (isLoaded && !username) {
      alert('로그인이 필요한 페이지입니다.');
      router.push('/members/login');
      return;
    }
  }, [isLoaded, username, router]);

  // 필수 정보 불러오기
  useEffect(() => {
    const savedBasicData = sessionStorage.getItem('projectBasicData');
    if (!savedBasicData) {
      alert('필수 정보가 없습니다. 다시 입력해주세요.');
      router.push('/projects/create');
      return;
    }
    
    try {
      const parsed = JSON.parse(savedBasicData);
      setBasicData(parsed);
    } catch (error) {
      console.error('기본 데이터 파싱 실패:', error);
      router.push('/projects/create');
    }
  }, [router]);

  const handleInputChange = (field: keyof AdditionalFormData, value: string | string[]) => {
    setAdditionalData(prev => ({ ...prev, [field]: value }));
  };

  const handleTechStackChange = (techStack: string) => {
    setAdditionalData(prev => {
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



  // 임시 파일 선택 핸들러 - create 모드에서 실제 파일 저장
  const handleTempFilesChange = (files: File[]) => {
    setSelectedFiles(files);
    // 파일 정보를 ProjectFileManager 형태로 변환
    const fileInfos: FileItem[] = files.map((file) => ({
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type
    }));
    setProjectFiles(fileInfos);
  };

  // 완전한 프로젝트 생성
  const handleCompleteSubmit = async () => {
    if (!basicData) {
      alert('필수 정보가 없습니다.');
      return;
    }

    // 사용자 인증 확인
    if (!username || !memberId || !isLoaded) {
      alert('로그인이 필요합니다.');
      router.push('/members/login');
      return;
    }

    setCreating(true);
    try {
      const requestData: ProjectRequest = {
        // 기본 정보
        title: basicData.title,
        description: basicData.description,
        projectField: basicData.projectField as ProjectRequest['projectField'],
        recruitmentType: basicData.recruitmentType as ProjectRequest['recruitmentType'],
        budgetType: basicData.budgetType as ProjectRequest['budgetType'],
        startDate: basicData.startDate,
        endDate: basicData.endDate,
        managerId: memberId,
        
        // 추가 정보 (빈 문자열을 undefined로 처리)
        partnerType: additionalData.partnerType && additionalData.partnerType.trim() 
          ? additionalData.partnerType as ProjectRequest['partnerType'] 
          : undefined,
        progressStatus: additionalData.progressStatus && additionalData.progressStatus.trim() 
          ? additionalData.progressStatus as ProjectRequest['progressStatus'] 
          : undefined,
        companyLocation: additionalData.companyLocation && additionalData.companyLocation.trim() 
          ? additionalData.companyLocation as ProjectRequest['companyLocation'] 
          : undefined,
        techNames: additionalData.techNames && additionalData.techNames.length > 0 ? additionalData.techNames : undefined
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/complete`, {
        method: 'POST',
        credentials: 'include', // 중요: 쿠키를 포함하여 요청
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        const projectId = result.data?.id;
        
        // 프로젝트 생성 성공 후 파일 업로드
        let uploadedFilesCount = 0;
        const failedFiles: string[] = [];
        
        if (selectedFiles.length > 0 && projectId) {
          setUploadingFiles(true);
          setUploadProgress({ current: 0, total: selectedFiles.length });
          
          try {
            for (let i = 0; i < selectedFiles.length; i++) {
              const file = selectedFiles[i];
              setUploadProgress({ current: i + 1, total: selectedFiles.length });
              const formData = new FormData();
              formData.append('file', file);
              
              const fileUploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/upload`, {
                method: 'POST',
                credentials: 'include', // 파일 업로드도 인증 필요
                body: formData,
              });
              
              if (fileUploadResponse.ok) {
                uploadedFilesCount++;
                
                // 업로드 성공한 파일 정보를 세션 스토리지에 저장 (상세 페이지에서 즉시 표시용)
                const uploadResult = await fileUploadResponse.json();
                if (uploadResult.data) {
                  // 기존 파일 리스트에 새 파일 추가
                  const existingFiles = sessionStorageUtils.getProjectFiles(projectId) || [];
                  existingFiles.push(uploadResult.data);
                  sessionStorageUtils.setProjectFiles(projectId, existingFiles);
                }
              } else {
                console.error('파일 업로드 실패:', file.name);
                failedFiles.push(file.name);
              }
            }
          } catch (fileError) {
            console.error('파일 업로드 중 오류:', fileError);
          } finally {
            setUploadingFiles(false);
            setUploadProgress({ current: 0, total: 0 });
          }
        }
        
        // 프로젝트 생성 완료 플래그 설정
        sessionStorageUtils.setProjectUpdated(projectId);
        
        // 세션스토리지 정리
        sessionStorage.removeItem('projectBasicData');
        
        // 업로드 결과에 따른 메시지 표시
        if (selectedFiles.length > 0) {
          if (failedFiles.length === 0) {
            alert(`프로젝트가 등록되었습니다! (파일 ${uploadedFilesCount}개 업로드 완료)`);
          } else if (uploadedFilesCount > 0) {
            alert(`프로젝트가 등록되었습니다! (파일 ${uploadedFilesCount}개 업로드 완료, ${failedFiles.length}개 실패: ${failedFiles.join(', ')})`);
          } else {
            alert('프로젝트가 등록되었지만 파일 업로드에 실패했습니다. 프로젝트 상세 페이지에서 파일을 다시 업로드해 주세요.');
          }
        } else {
          alert('프로젝트가 등록되었습니다!');
        }
        
        // 생성된 프로젝트의 상세 페이지로 이동
        router.push(`/user-projects/1/${projectId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || '프로젝트 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로젝트 등록 실패:', error);
      alert('프로젝트 등록 중 오류가 발생했습니다.');
    } finally {
      setCreating(false);
    }
  };

  // 기본 정보 수정으로 돌아가기
  const handleGoBack = () => {
    router.push('/projects/create');
  };



  if (!basicData) {
    return <LoadingSpinner message="데이터를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-6xl mx-auto px-6 py-8" style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="flex gap-8">
          {/* 메인 폼 영역 */}
          <div className="flex-1" style={{ flex: 1 }}>
            {/* 헤더 */}
            <div className="mb-8" style={{ marginBottom: '32px' }}>
              <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontSize: '30px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                추가 정보 입력
              </h1>
              <p className="text-gray-600" style={{ color: '#4b5563' }}>
                더 나은 매칭을 위해 추가 정보를 입력해주세요. (선택사항)
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 space-y-8" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '32px' }}>
              
              {/* 프로젝트 진행 상황 */}
              <div className="mb-8" style={{ marginBottom: '32px' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  프로젝트 진행 상황은 어떤신가요?
                </label>
                <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {progressStatusOptions.map(option => (
                    <div
                      key={option.value}
                      onClick={() => handleInputChange('progressStatus', option.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        additionalData.progressStatus === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        padding: '16px',
                        border: `2px solid ${additionalData.progressStatus === option.value ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: additionalData.progressStatus === option.value ? '#eff6ff' : 'white'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xl" style={{ fontSize: '20px' }}>{option.icon}</div>
                        <div className="font-medium text-gray-900" style={{ fontWeight: '500', color: '#111827' }}>
                          {option.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 내부에 IT 전담 인력이 있는지 */}
              <div className="mb-8" style={{ marginBottom: '32px' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  선호하시는 파트너의 형태를 알려주세요
                </label>
                <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {partnerTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="partnerType"
                        value={option.value}
                        checked={additionalData.partnerType === option.value}
                        onChange={(e) => handleInputChange('partnerType', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span className="ml-3 text-gray-700" style={{ marginLeft: '12px', color: '#374151' }}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>


              </div>

              {/* 기술 스택 */}
              <div className="mb-8" style={{ marginBottom: '32px' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  프로젝트 정의를 위한 기술을 알려주세요 (중복 선택 가능)
                </label>
                <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {Object.entries(techStackCategories).map(([category, techs]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-600 mb-3" style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '12px' }}>
                        {category}
                      </h4>
                      <div className="grid grid-cols-4 gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {techs.map(tech => (
                          <label key={tech.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '12px', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            backgroundColor: additionalData.techNames?.includes(tech.value) ? '#eff6ff' : 'white',
                            borderColor: additionalData.techNames?.includes(tech.value) ? '#3b82f6' : '#d1d5db'
                          }}>
                            <input
                              type="checkbox"
                              checked={additionalData.techNames?.includes(tech.value) || false}
                              onChange={() => handleTechStackChange(tech.value)}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium" style={{ fontSize: '14px', fontWeight: '500', color: additionalData.techNames?.includes(tech.value) ? '#1d4ed8' : '#374151' }}>
                              {tech.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 회사 위치 */}
              <div className="mb-8" style={{ marginBottom: '32px' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  팀을 만들어 일할 회사 위치를 알려주세요
                </label>
                <select
                  value={additionalData.companyLocation}
                  onChange={(e) => handleInputChange('companyLocation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="">지역을 선택해주세요</option>
                  {regionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 첨부파일 */}
              <div className="mb-8" style={{ marginBottom: '32px' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  참고할 수 있는 파일을 등록해주세요
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center" style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    id="fileInput"
                    disabled={creating}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        handleTempFilesChange(files);
                      }
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor="fileInput" className="block cursor-pointer" style={{ display: 'block', cursor: creating ? 'not-allowed' : 'pointer' }}>
                    <div className="text-gray-400 text-4xl mb-3" style={{ fontSize: '36px', marginBottom: '12px' }}>📁</div>
                    <div className="text-gray-600 font-medium mb-2" style={{ color: '#4b5563', fontWeight: '500', marginBottom: '8px' }}>
                      {creating ? '프로젝트 등록 중...' : '파일을 클릭하여 선택하세요'}
                    </div>
                    <div className="text-gray-500 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>
                      {creating ? '잠시만 기다려주세요.' : 'PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF 파일을 선택할 수 있습니다'}
                    </div>
                  </label>
                </div>

                {/* 선택된 파일 목록 */}
                {projectFiles.length > 0 && (
                  <div className="mt-4" style={{ marginTop: '16px' }}>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      선택된 파일 ({projectFiles.length}개)
                    </h5>
                    <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {projectFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                          <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="text-blue-500 text-lg" style={{ color: '#3b82f6', fontSize: '18px' }}>📄</div>
                            <div>
                              <div className="text-sm font-medium text-gray-900" style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                                {file.originalName}
                              </div>
                              <div className="text-xs text-gray-500" style={{ fontSize: '12px', color: '#6b7280' }}>
                                {file.fileSize && `${(file.fileSize / 1024).toFixed(1)} KB`}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = projectFiles.filter((_, i) => i !== index);
                              const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
                              setProjectFiles(newFiles);
                              setSelectedFiles(newSelectedFiles);
                            }}
                            disabled={creating}
                            className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                            style={{ color: '#ef4444', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.5 : 1 }}
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 버튼들 */}
              <div className="flex gap-4 pt-6" style={{ display: 'flex', gap: '16px', paddingTop: '24px' }}>
                <button
                  type="button"
                  onClick={handleGoBack}
                  disabled={creating}
                  className="px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  style={{ 
                    padding: '16px 32px', 
                    backgroundColor: '#e5e7eb', 
                    color: '#374151', 
                    fontWeight: '600', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: creating ? 'not-allowed' : 'pointer', 
                    transition: 'background-color 0.2s',
                    opacity: creating ? 0.5 : 1
                  }}
                >
                  이전으로
                </button>
                
                <button
                  type="button"
                  onClick={handleCompleteSubmit}
                  disabled={creating}
                  className="flex-1 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    flex: 1,
                    padding: '16px 0', 
                    backgroundColor: creating ? '#9ca3af' : '#3b82f6', 
                    color: 'white', 
                    fontWeight: '600', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: creating ? 'not-allowed' : 'pointer', 
                    transition: 'background-color 0.2s',
                    opacity: creating ? 0.5 : 1
                  }}
                >
                  {creating 
                    ? uploadingFiles 
                      ? `파일 업로드 중... (${uploadProgress.current}/${uploadProgress.total})`
                      : '프로젝트 등록 중...' 
                    : '프로젝트 등록 완료'}
                </button>
              </div>
            </div>
          </div>

          {/* 우측 미리보기 */}
          <div className="w-80 sticky top-8" style={{ width: '320px', position: 'sticky', top: '32px', height: 'fit-content' }}>
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '24px' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                📋 프로젝트 미리보기
              </h3>
              
              <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 기본 정보 */}
                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>분야</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {basicData.projectField === 'PLANNING' && '기획'}
                    {basicData.projectField === 'DESIGN' && '디자인'}
                    {basicData.projectField === 'DEVELOPMENT' && '개발'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>모집 형태</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {basicData.recruitmentType === 'PROJECT_CONTRACT' && '외주'}
                    {basicData.recruitmentType === 'PERSONAL_CONTRACT' && '상주'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>제목</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {basicData.title}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>예산</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {budgetOptions.find(opt => opt.value === basicData.budgetType)?.label}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>기간</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {basicData.startDate} ~ {basicData.endDate}
                  </div>
                </div>

                {/* 추가 정보 */}
                {additionalData.progressStatus && (
                  <div>
                    <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>진행 상황</div>
                    <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                      {additionalData.progressStatus === 'IDEA_STAGE' && '아이디어 구상 단계'}
                      {additionalData.progressStatus === 'CONTENT_ORGANIZED' && '내용 정리 완료'}
                      {additionalData.progressStatus === 'DETAILED_PLAN' && '상세 기획 완료'}
                    </div>
                  </div>
                )}

                {additionalData.companyLocation && (
                  <div>
                    <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>지역</div>
                    <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                      {regionOptions.find(opt => opt.value === additionalData.companyLocation)?.label}
                    </div>
                  </div>
                )}

                {additionalData.techNames.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>기술 스택</div>
                    <div className="flex flex-wrap gap-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {additionalData.techNames.slice(0, 6).map(tech => (
                        <span key={tech} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded" style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '4px' }}>
                          {tech}
                        </span>
                      ))}
                      {additionalData.techNames.length > 6 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded" style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '4px' }}>
                          +{additionalData.techNames.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {projectFiles.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>첨부파일</div>
                    <div className="text-sm text-gray-700" style={{ fontSize: '14px', color: '#374151' }}>
                      {projectFiles.length}개 파일
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreateAdditionalPage;
