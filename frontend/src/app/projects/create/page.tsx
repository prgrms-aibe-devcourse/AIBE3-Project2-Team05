"use client";

import { useUser } from '@/app/context/UserContext';
import { budgetOptions } from '@/constants/projectOptions';
import { components } from '@/lib/backend/schema';
import { showErrorMessage, showSuccessMessage, showValidationError } from '@/utils/formValidation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectRequest = components['schemas']['ProjectRequest'];

interface FormData {
  title: string;
  description: string;
  projectField: string;
  recruitmentType: string;
  budgetType: string;
  startDate: string;
  endDate: string;
}

const ProjectCreatePage = () => {
  const router = useRouter();
  const { username, memberId, isLoaded } = useUser();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    projectField: '',
    recruitmentType: '',
    budgetType: '',
    startDate: '',
    endDate: ''
  });
  const [creating, setCreating] = useState(false);

  // 페이지 접근 시 로그인 체크
  useEffect(() => {
    if (isLoaded && !username) {
      showErrorMessage('로그인이 필요한 페이지입니다.');
      router.push('/members/login');
    }
  }, [isLoaded, username, router]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 필수 항목 검증
  const isFormValid = () => {
    return formData.title.trim() && 
           formData.description.trim() && 
           formData.projectField && 
           formData.recruitmentType && 
           formData.budgetType && 
           formData.startDate && 
           formData.endDate;
  };

  // 기본 프로젝트 등록 (필수 정보만)
  const handleBasicSubmit = async () => {
    if (!isFormValid()) {
      showValidationError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setCreating(true);
    try {
      // 사용자 인증 확인
      if (!username || !memberId || !isLoaded) {
        showErrorMessage('로그인이 필요합니다.');
        router.push('/members/login');
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
        managerId: memberId
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
        
        // 세션스토리지 정리
        sessionStorage.removeItem('projectBasicData');
        
        showSuccessMessage('프로젝트가 등록되었습니다!');
        
        // 생성된 프로젝트의 상세 페이지로 이동
        router.push(`/user-projects/1/${projectId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showErrorMessage(errorData.message || '프로젝트 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로젝트 등록 실패:', error);
      showErrorMessage('프로젝트 등록 중 오류가 발생했습니다.');
    } finally {
      setCreating(false);
    }
  };



  // 추가 정보 입력으로 이동
  const handleContinueToAdditional = () => {
    if (!isFormValid()) {
      showValidationError('모든 필수 항목을 입력해주세요.');
      return;
    }
    
    // 현재 폼 데이터를 세션스토리지에 저장
    sessionStorage.setItem('projectBasicData', JSON.stringify(formData));
    router.push('/projects/create/additional');
  };



  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-6xl mx-auto px-6 py-8" style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="flex gap-8">
          {/* 메인 폼 영역 */}
          <div className="flex-1" style={{ flex: 1 }}>
            {/* 헤더 */}
            <div className="mb-8" style={{ marginBottom: '32px' }}>
              <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontSize: '30px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                프로젝트 등록
              </h1>
              <p className="text-gray-600" style={{ color: '#4b5563' }}>
                프로젝트 필수 정보를 입력해주세요. 등록 후 추가 정보를 입력할 수 있습니다.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 space-y-6" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '32px' }}>
              
              {/* 프로젝트 분야 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  어떤 분야의 프로젝트인가요? *
                </label>
                <div className="grid grid-cols-3 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { value: 'PLANNING', label: '기획', icon: '💡' },
                    { value: 'DESIGN', label: '디자인', icon: '🎨' },
                    { value: 'DEVELOPMENT', label: '개발', icon: '💻' }
                  ].map(option => (
                    <div
                      key={option.value}
                      onClick={() => handleInputChange('projectField', option.value)}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all text-center ${
                        formData.projectField === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        padding: '24px',
                        border: `2px solid ${formData.projectField === option.value ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                        backgroundColor: formData.projectField === option.value ? '#eff6ff' : 'white'
                      }}
                    >
                      <div className="text-3xl mb-2" style={{ fontSize: '30px', marginBottom: '8px' }}>{option.icon}</div>
                      <div className="font-semibold text-gray-900" style={{ fontWeight: '600', color: '#111827' }}>
                        {option.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 모집 형태 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  어떤 형태로 모집하시나요? *
                </label>
                <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {[
                    { 
                      value: 'PROJECT_CONTRACT', 
                      label: '프로젝트 단위 계약', 
                      sub: '(외주)', 
                      icon: '📋' 
                    },
                    { 
                      value: 'PERSONAL_CONTRACT', 
                      label: '개인 인력의 기간/시간제 계약', 
                      sub: '(상주)', 
                      icon: '👥' 
                    }
                  ].map(option => (
                    <div
                      key={option.value}
                      onClick={() => handleInputChange('recruitmentType', option.value)}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.recruitmentType === option.value 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        padding: '24px',
                        border: `2px solid ${formData.recruitmentType === option.value ? '#f97316' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: formData.recruitmentType === option.value ? '#fff7ed' : 'white'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl" style={{ fontSize: '24px' }}>{option.icon}</div>
                        <div>
                          <div className="font-semibold text-gray-900" style={{ fontWeight: '600', color: '#111827' }}>
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500" style={{ fontSize: '14px', color: '#6b7280' }}>
                            {option.sub}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 프로젝트 제목 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  프로젝트 제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ width: '100%', padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  placeholder="프로젝트 제목을 입력하세요"
                  maxLength={100}
                />
              </div>

              {/* 프로젝트 설명 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  프로젝트 설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ width: '100%', padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '150px' }}
                  placeholder="프로젝트에 대해 자세히 설명해주세요..."
                />
              </div>

              {/* 예산 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  생각하시는 프로젝트 예상 금액은? *
                </label>
                <select
                  value={formData.budgetType}
                  onChange={(e) => handleInputChange('budgetType', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ width: '100%', padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="">예산을 선택하세요</option>
                  {budgetOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 프로젝트 기간 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  프로젝트 예상 기간을 알려주세요 *
                </label>
                <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2" style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
                      시작 날짜
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2" style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
                      종료 날짜
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>

              {/* 하단 버튼들 */}
              <div className="flex gap-4 pt-6" style={{ display: 'flex', gap: '16px', paddingTop: '24px' }}>
                <button
                  type="button"
                  onClick={handleBasicSubmit}
                  disabled={!isFormValid() || creating}
                  className="flex-1 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    flex: 1,
                    padding: '16px 0', 
                    backgroundColor: (isFormValid() && !creating) ? '#3b82f6' : '#9ca3af', 
                    color: 'white', 
                    fontWeight: '600', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: (isFormValid() && !creating) ? 'pointer' : 'not-allowed', 
                    transition: 'background-color 0.2s',
                    opacity: (isFormValid() && !creating) ? 1 : 0.5
                  }}
                >
                  {creating ? '등록 중...' : '바로 프로젝트 등록'}
                </button>
                
                <button
                  type="button"
                  onClick={handleContinueToAdditional}
                  disabled={!isFormValid() || creating}
                  className="flex-1 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    flex: 1,
                    padding: '16px 0', 
                    backgroundColor: (isFormValid() && !creating) ? '#f97316' : '#9ca3af', 
                    color: 'white', 
                    fontWeight: '600', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: (isFormValid() && !creating) ? 'pointer' : 'not-allowed', 
                    transition: 'background-color 0.2s',
                    opacity: (isFormValid() && !creating) ? 1 : 0.5
                  }}
                >
                  {creating ? '잠시만 기다려주세요...' : '추가 정보 입력하기'}
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
                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>분야</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {formData.projectField === 'PLANNING' && '기획'}
                    {formData.projectField === 'DESIGN' && '디자인'}
                    {formData.projectField === 'DEVELOPMENT' && '개발'}
                    {!formData.projectField && '-'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>모집 형태</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {formData.recruitmentType === 'PROJECT_CONTRACT' && '외주'}
                    {formData.recruitmentType === 'PERSONAL_CONTRACT' && '상주'}
                    {!formData.recruitmentType && '-'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>제목</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {formData.title || '-'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>설명</div>
                  <div className="text-sm text-gray-700 max-h-20 overflow-y-auto" style={{ fontSize: '14px', color: '#374151', maxHeight: '80px', overflowY: 'auto' }}>
                    {formData.description || '-'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>예산</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {budgetOptions.find(opt => opt.value === formData.budgetType)?.label || '-'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500" style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>기간</div>
                  <div className="text-base font-medium text-gray-900" style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {formData.startDate && formData.endDate 
                      ? `${formData.startDate} ~ ${formData.endDate}`
                      : '-'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreatePage;
