"use client";

import LoadingSpinner from '@/components/LoadingSpinner';
import { components } from '@/lib/backend/schema';
import {
  calculateDday,
  getBudgetTypeText,
  getProjectFieldText,
  getRecruitmentTypeText,
  getStatusText
} from '@/utils/projectUtils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectResponse = components['schemas']['ProjectResponse'];
type PageProjectResponse = components['schemas']['PageProjectResponse'];

const UserProjectsPage = () => {
  const router = useRouter();
  const params = useParams();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [managerId, setManagerId] = useState<string>('1');
  const [activeStatus, setActiveStatus] = useState<string>('ALL');

  // 프로젝트 상태 옵션
  const statusOptions = [
    { key: 'ALL', label: '전체', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { key: 'RECRUITING', label: '모집중', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { key: 'CONTRACTING', label: '계약중', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { key: 'IN_PROGRESS', label: '진행중', color: 'bg-green-100 text-green-700 border-green-300' },
    { key: 'COMPLETED', label: '완료', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { key: 'SUSPENDED', label: '보류', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { key: 'CANCELLED', label: '취소', color: 'bg-red-100 text-red-700 border-red-300' }
  ];

  // URL 파라미터에서 managerId 설정
  useEffect(() => {
    if (params?.managerId) {
      setManagerId(params.managerId as string);
    }
  }, [params?.managerId]);

  // 백엔드에서 프로젝트 목록 가져오기
  useEffect(() => {
    if (!managerId) return;

    const fetchMyProjects = async () => {
      setLoading(true);
      try {
        console.log('API 호출 URL:', `/api/projects/manager/${managerId}`);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/manager/${managerId}?size=100`);
        if (response.ok) {
          const data: PageProjectResponse = await response.json();
          console.log('API 응답 데이터:', data);
          setProjects(data.content || []);
        }
      } catch (error) {
        console.error('내 프로젝트 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, [managerId]);

  // 상태별 필터링
  useEffect(() => {
    if (activeStatus === 'ALL') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.status === activeStatus));
    }
  }, [projects, activeStatus]);

  // 상태별 프로젝트 개수 계산
  const getStatusCount = (status: string) => {
    if (status === 'ALL') return projects.length;
    return projects.filter(project => project.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: "var(--background)" }}>
      <main className="max-w-7xl mx-auto p-6" style={{ maxWidth: '80rem', margin: '0 auto', padding: '24px' }}>
        {/* 페이지 헤더 */}
        <div className="mb-8" style={{ marginBottom: '32px' }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
            내 프로젝트 관리
          </h1>
          <p className="text-gray-600 text-lg" style={{ color: '#4b5563', fontSize: '18px' }}>
            등록한 프로젝트를 관리하고 지원자를 확인하세요.
          </p>
        </div>

        {/* 상태 필터 탭 */}
        <div className="mb-8" style={{ marginBottom: '32px' }}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb', padding: '8px' }}>
            <div className="flex flex-wrap gap-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {statusOptions.map((option) => {
                const count = getStatusCount(option.key);
                const isActive = activeStatus === option.key;
                
                return (
                  <button
                    key={option.key}
                    onClick={() => setActiveStatus(option.key)}
                    className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 border ${
                      isActive 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105' 
                        : `${option.color} hover:shadow-sm hover:scale-102`
                    }`}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      border: isActive ? '1px solid #3b82f6' : '1px solid',
                      backgroundColor: isActive ? '#3b82f6' : '',
                      color: isActive ? 'white' : '',
                      cursor: 'pointer',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        (e.target as HTMLButtonElement).style.transform = 'scale(1.02)';
                        (e.target as HTMLButtonElement).style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                        (e.target as HTMLButtonElement).style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                      }
                    }}
                  >
                    {option.label}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      isActive 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : 'bg-white bg-opacity-60'
                    }`} style={{
                      marginLeft: '8px',
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 새 프로젝트 등록 버튼 */}
        <div className="mb-6 flex justify-end" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => router.push('/projects/create')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            style={{ 
              background: 'linear-gradient(to right, #f97316, #ef4444)',
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '12px',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: 'none', 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              transform: 'scale(1)'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
          >
            + 새 프로젝트 등록
          </button>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <LoadingSpinner message="프로젝트를 불러오는 중..." />
        )}

        {/* 프로젝트 목록 */}
        {!loading && (
          <>
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '48px', textAlign: 'center' }}>
                <div className="text-gray-400 text-6xl mb-4" style={{ color: '#9ca3af', fontSize: '60px', marginBottom: '16px' }}>📋</div>
                <div className="text-gray-600 text-lg mb-6" style={{ color: '#4b5563', fontSize: '18px', marginBottom: '24px' }}>
                  {activeStatus === 'ALL' ? '등록된 프로젝트가 없습니다.' : `${getStatusText(activeStatus)} 상태의 프로젝트가 없습니다.`}
                </div>
                {activeStatus === 'ALL' && (
                  <button
                    onClick={() => router.push('/projects/create')}
                    className="bg-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    style={{ backgroundColor: '#3b82f6', color: 'white', padding: '12px 32px', borderRadius: '12px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
                  >
                    첫 번째 프로젝트 등록하기
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '12px', 
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                      border: '1px solid #e5e7eb', 
                      overflow: 'hidden', 
                      cursor: 'pointer', 
                      transition: 'all 0.3s'
                    }}
                    onClick={() => router.push(`/user-projects/${managerId}/${project.id}`)}
                    onMouseOver={(e) => {
                      (e.target as HTMLDivElement).style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      (e.target as HTMLDivElement).style.borderColor = '#bfdbfe';
                      (e.target as HTMLDivElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLDivElement).style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                      (e.target as HTMLDivElement).style.borderColor = '#e5e7eb';
                      (e.target as HTMLDivElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* 프로젝트 헤더 */}
                    <div className="p-6 pb-4" style={{ padding: '24px 24px 16px 24px' }}>
                      <div className="flex justify-between items-start mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors" 
                            style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', transition: 'color 0.2s' }}>
                          {project.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-3 flex-shrink-0 ${
                          project.status === 'RECRUITING' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'CONTRACTING' ? 'bg-orange-100 text-orange-700' :
                          project.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' :
                          project.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                          project.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`} style={{ 
                          padding: '4px 12px', 
                          borderRadius: '9999px', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          marginLeft: '12px', 
                          flexShrink: 0 
                        }}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        <span className="bg-gray-100 px-2 py-1 rounded-md" style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' }}>
                          {getProjectFieldText(project.projectField)}
                        </span>
                        <span>{getRecruitmentTypeText(project.recruitmentType)}</span>
                        {project.endDate && (
                          <span className="text-red-600 font-medium" style={{ color: '#dc2626', fontWeight: '500' }}>
                            {calculateDday(project.endDate)}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 text-sm line-clamp-3 mb-4" style={{ color: '#374151', fontSize: '14px', marginBottom: '16px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {project.description}
                      </p>
                    </div>

                    {/* 프로젝트 정보 */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200" style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                      <div className="grid grid-cols-2 gap-4 text-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '14px' }}>
                        <div>
                          <span className="text-gray-500" style={{ color: '#6b7280' }}>예산</span>
                          <div className="font-medium text-gray-900" style={{ fontWeight: '500', color: '#111827' }}>{getBudgetTypeText(project.budgetType)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500" style={{ color: '#6b7280' }}>지원자수</span>
                          <div className="font-medium text-gray-900" style={{ fontWeight: '500', color: '#111827' }}>{project.applicantCount || 0}명</div>
                        </div>
                      </div>
                      
                      {project.startDate && project.endDate && (
                        <div className="mt-3 pt-3 border-t border-gray-200" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                          <span className="text-gray-500 text-sm" style={{ color: '#6b7280', fontSize: '14px' }}>기간</span>
                          <div className="text-sm font-medium text-gray-900" style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {new Date(project.startDate).toLocaleDateString()} ~ {new Date(project.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 관리 버튼들 */}
                    <div className="p-4 bg-white border-t border-gray-100" style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
                      <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user-projects/${managerId}/${project.id}`);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                          style={{ 
                            flex: 1,
                            padding: '8px 12px', 
                            backgroundColor: '#3b82f6', 
                            color: 'white', 
                            borderRadius: '8px', 
                            fontSize: '14px',
                            fontWeight: '500',
                            border: 'none', 
                            cursor: 'pointer', 
                            transition: 'background-color 0.2s' 
                          }}
                          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
                        >
                          상세보기
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user-projects/${managerId}/${project.id}/edit`);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          style={{ 
                            flex: 1,
                            padding: '8px 12px', 
                            backgroundColor: '#f3f4f6', 
                            color: '#374151', 
                            borderRadius: '8px', 
                            fontSize: '14px',
                            fontWeight: '500',
                            border: 'none', 
                            cursor: 'pointer', 
                            transition: 'background-color 0.2s' 
                          }}
                          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                        >
                          수정
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${project.title}" 프로젝트를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
                              try {
                                console.log('프로젝트 삭제 시작:', project.id);
                                console.log('managerId:', managerId);
                                
                                // 먼저 DELETE API 시도
                                const deleteUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${project.id}?requesterId=${managerId}`;
                                console.log('삭제 API URL:', deleteUrl);
                                
                                const response = await fetch(deleteUrl, {
                                  method: 'DELETE',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                });
                                
                                console.log('삭제 API 응답 상태:', response.status);
                                
                                if (response.ok) {
                                  console.log('삭제 성공');
                                  alert('프로젝트가 삭제되었습니다.');
                                  // 로컬 상태에서 프로젝트 제거
                                  setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id));
                                } else if (response.status === 404 || response.status === 405) {
                                  // DELETE API가 없는 경우, 상태를 CANCELLED로 변경하는 방식으로 시도
                                  console.log('DELETE API가 없음, 상태 변경으로 시도');
                                  
                                  const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${project.id}/status`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ 
                                      status: 'CANCELLED',
                                      changedById: Number(managerId)
                                    }),
                                  });
                                  
                                  if (statusResponse.ok) {
                                    console.log('프로젝트 취소 성공');
                                    alert('프로젝트가 취소되었습니다.');
                                    // 로컬 상태에서 프로젝트 상태 업데이트
                                    setProjects(prevProjects => 
                                      prevProjects.map(p => 
                                        p.id === project.id ? { ...p, status: 'CANCELLED' } : p
                                      )
                                    );
                                  } else {
                                    const errorData = await statusResponse.json().catch(() => ({}));
                                    console.error('상태 변경 실패:', errorData);
                                    alert(errorData.message || '프로젝트 삭제에 실패했습니다.');
                                  }
                                } else {
                                  const errorText = await response.text();
                                  console.error('삭제 실패:', errorText);
                                  alert(`프로젝트 삭제에 실패했습니다. (상태: ${response.status})`);
                                }
                              } catch (error) {
                                console.error('삭제 오류:', error);
                                const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                                alert('프로젝트 삭제 중 오류가 발생했습니다: ' + errorMessage);
                              }
                            }
                          }}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          style={{ 
                            padding: '8px 12px', 
                            backgroundColor: '#fee2e2', 
                            color: '#dc2626', 
                            borderRadius: '8px', 
                            fontSize: '14px',
                            fontWeight: '500',
                            border: 'none', 
                            cursor: 'pointer', 
                            transition: 'background-color 0.2s' 
                          }}
                          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#fecaca'}
                          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#fee2e2'}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default UserProjectsPage;
