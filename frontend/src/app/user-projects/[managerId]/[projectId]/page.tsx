"use client";

import ProjectFileManager from '@/components/ProjectFileManager';
import { components } from '@/lib/backend/schema';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectResponse = components['schemas']['ProjectResponse'];
type ProjectFile = components['schemas']['ProjectFile'];
type ProjectFileInfo = components['schemas']['ProjectFileInfo'];

// 두 타입을 모두 지원하는 유니온 타입
type FileItem = ProjectFile | ProjectFileInfo;

const UserProjectDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [activeTab, setActiveTab] = useState('summary');
    const [statusChangeLoading, setStatusChangeLoading] = useState(false);
    // 파일 상태를 별도로 관리 (ProjectResponse의 projectFiles는 ProjectFileInfo[] 타입)
    const [projectFiles, setProjectFiles] = useState<FileItem[]>([]);

    useEffect(() => {
        const fetchProject = async (forceRefresh = false) => {
            if (!params?.projectId) return;

            setLoading(true);
            try {
                // 캐시 방지를 위한 타임스탬프 추가
                const timestamp = new Date().getTime();

                // 프로젝트 업데이트 플래그 확인 (프로젝트별)
                const projectUpdateKey = `projectUpdated_${params.projectId}`;
                const projectUpdateTimeKey = `projectUpdateTime_${params.projectId}`;
                const projectUpdated = sessionStorage.getItem(projectUpdateKey);

                if (projectUpdated === 'true' || forceRefresh) {
                    // 세션 스토리지 플래그 제거
                    sessionStorage.removeItem(projectUpdateKey);
                    sessionStorage.removeItem(projectUpdateTimeKey);
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${params.projectId}?_t=${timestamp}`, {
                    cache: 'no-store', // Next.js 캐시 방지
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate', // 브라우저 캐시 방지
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                if (response.ok) {
                    const data: ProjectResponse = await response.json();
                          // 세션 스토리지에서 파일 상태 복원 시도 (TTL 확인 포함)
                const projectFilesKey = `projectFiles_${params.projectId}`;
                const projectFilesTimeKey = `projectFilesTime_${params.projectId}`;
                const savedFilesStr = sessionStorage.getItem(projectFilesKey);
                const savedFilesTime = sessionStorage.getItem(projectFilesTimeKey);
                
                let finalFiles: FileItem[] = [];
                
                // TTL 확인 (30분 = 1800000ms)
                const TTL = 30 * 60 * 1000;
                const isSessionValid = savedFilesTime && (Date.now() - parseInt(savedFilesTime)) < TTL;
                
                if (savedFilesStr && isSessionValid) {
                    try {
                        const savedFiles = JSON.parse(savedFilesStr) as FileItem[];
                        // API 응답에 파일이 없고 세션스토리지에는 있으면 세션스토리지 우선
                        if (!data.projectFiles || data.projectFiles.length === 0) {
                            finalFiles = savedFiles;
                        } else {
                            // API 응답에 파일이 있으면 API 응답 우선하고 세션스토리지 제거
                            finalFiles = data.projectFiles;
                            sessionStorage.removeItem(projectFilesKey);
                            sessionStorage.removeItem(projectFilesTimeKey);
                        }
                    } catch (e) {
                        console.error('세션 스토리지 파일 상태 파싱 실패:', e);
                        finalFiles = data.projectFiles || [];
                        // 파싱 실패 시 세션 스토리지 정리
                        sessionStorage.removeItem(projectFilesKey);
                        sessionStorage.removeItem(projectFilesTimeKey);
                    }
                } else {
                    // 세션 스토리지가 없거나 만료된 경우
                    finalFiles = data.projectFiles || [];
                    
                    // 만료된 세션 스토리지 정리
                    if (savedFilesStr && !isSessionValid) {
                        sessionStorage.removeItem(projectFilesKey);
                        sessionStorage.removeItem(projectFilesTimeKey);
                    }
                }
                    
                    setProject({
                        ...data,
                        projectFiles: finalFiles
                    });
                    
                    // 파일 상태도 함께 업데이트
                    setProjectFiles(finalFiles);
                    setError('');
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

        // 윈도우 포커스 시 데이터 새로고침 (편집 페이지에서 돌아왔을 때)
        const handleWindowFocus = () => {
            fetchProject(true); // 강제 새로고침
        };

        // 페이지 가시성 변경 시에도 새로고침 (다른 탭에서 돌아왔을 때)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchProject(true); // 강제 새로고침
            }
        };

        window.addEventListener('focus', handleWindowFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('focus', handleWindowFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [params?.projectId]);

    // 파일 변경 핸들러 추가
    const handleFilesChange = (files: FileItem[]) => {
        setProjectFiles(files);
        // 프로젝트 객체도 업데이트
        if (project) {
            setProject({
                ...project,
                projectFiles: files
            });
        }
    };

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

    // 지역을 한국어로 변환
    const getLocationText = (location?: string) => {
        const locationMap: Record<string, string> = {
            'SEOUL': '서울',
            'BUSAN': '부산',
            'DAEGU': '대구',
            'INCHEON': '인천',
            'GWANGJU': '광주',
            'DAEJEON': '대전',
            'ULSAN': '울산',
            'SEJONG': '세종',
            'GYEONGGI': '경기',
            'GANGWON': '강원',
            'CHUNGBUK': '충북',
            'CHUNGNAM': '충남',
            'JEONBUK': '전북',
            'JEONNAM': '전남',
            'GYEONGBUK': '경북',
            'GYEONGNAM': '경남',
            'JEJU': '제주',
            'OVERSEAS': '해외'
        };
        return locationMap[location || ''] || location || '';
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

    // 프로젝트 상태 변경 함수
    const handleStatusChange = async (newStatus: 'RECRUITING' | 'CONTRACTING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED') => {
        if (!project) return;

        const confirmMessage = getStatusChangeMessage(newStatus);
        if (!window.confirm(confirmMessage)) return;

        setStatusChangeLoading(true);
        try {
            // 실제 API 호출로 상태 변경
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${project.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    changedById: Number(params?.managerId) // 현재 사용자(매니저)의 ID 추가
                }),
            });

            if (response.ok) {
                const updatedProject: ProjectResponse = await response.json();
                setProject(updatedProject);
                alert(`프로젝트 상태가 "${getStatusText(newStatus)}"로 변경되었습니다.`);

                // 상태 변경 성공 후 내 프로젝트 관리 페이지로 이동
                router.push(`/user-projects/${params?.managerId}`);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('상태 변경 실패:', response.status, errorData);
                alert('상태 변경에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경에 실패했습니다. 네트워크 연결을 확인해주세요.');
        } finally {
            setStatusChangeLoading(false);
        }
    };

    // 상태 변경 확인 메시지
    const getStatusChangeMessage = (newStatus: string) => {
        const statusMessages: Record<string, string> = {
            'CONTRACTING': '계약 단계로 변경하시겠습니까?\n선택된 지원자와의 계약을 시작합니다.',
            'IN_PROGRESS': '프로젝트를 시작하시겠습니까?\n프로젝트가 진행 중 상태로 변경됩니다.',
            'COMPLETED': '프로젝트를 완료 처리하시겠습니까?\n완료 후에는 상태 변경이 불가능합니다.',
            'SUSPENDED': '프로젝트를 일시 보류하시겠습니까?\n나중에 다시 재개할 수 있습니다.',
            'CANCELLED': '프로젝트를 취소하시겠습니까?\n취소 후에는 상태 변경이 불가능합니다.'
        };
        return statusMessages[newStatus] || '상태를 변경하시겠습니까?';
    };

    // 현재 상태별 가능한 상태 변경 버튼들
    const getAvailableStatusButtons = () => {
        if (!project) return [];

        switch (project.status) {
            case 'RECRUITING':
                return [
                    { status: 'CONTRACTING', label: '계약 시작', color: 'blue', icon: '🤝' },
                    { status: 'CANCELLED', label: '모집 취소', color: 'red', icon: '❌' }
                ];

            case 'CONTRACTING':
                return [
                    { status: 'IN_PROGRESS', label: '프로젝트 시작', color: 'green', icon: '▶️' },
                    { status: 'SUSPENDED', label: '일시 보류', color: 'orange', icon: '⏸️' },
                    { status: 'CANCELLED', label: '계약 취소', color: 'red', icon: '❌' }
                ];

            case 'IN_PROGRESS':
                return [
                    { status: 'COMPLETED', label: '프로젝트 완료', color: 'purple', icon: '✅' },
                    { status: 'SUSPENDED', label: '일시 보류', color: 'orange', icon: '⏸️' },
                    { status: 'CANCELLED', label: '프로젝트 중단', color: 'red', icon: '❌' }
                ];

            case 'SUSPENDED':
                return [
                    { status: 'IN_PROGRESS', label: '프로젝트 재개', color: 'green', icon: '▶️' },
                    { status: 'CANCELLED', label: '프로젝트 취소', color: 'red', icon: '❌' }
                ];

            case 'COMPLETED':
            case 'CANCELLED':
                return []; // 상태 변경 불가

            default:
                return [];
        }
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

                {/* 첨부파일 */}
                <div id="files" className="bg-white rounded-xl shadow-sm mb-8 p-8" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '32px', padding: '32px' }}>
                    <ProjectFileManager
                        projectId={params?.projectId as string}
                        projectFiles={projectFiles}
                        onFilesChange={handleFilesChange}
                        disabled={true}
                        mode="view"
                    />
                </div>

                {/* 관리 버튼들 */}
                <div className="bg-white rounded-xl shadow-sm p-6" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '24px' }}>
                    {/* 프로젝트 상태 변경 */}
                    {(() => {
                        const availableButtons = getAvailableStatusButtons();
                        if (availableButtons.length > 0) {
                            return (
                                <div className="mb-6" style={{ marginBottom: '24px' }}>
                                    <h4 className="text-lg font-semibold mb-3 text-gray-900" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                                        프로젝트 상태 변경
                                    </h4>
                                    <div className="flex gap-3 flex-wrap" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {availableButtons.map((button) => (
                                            <button
                                                key={button.status}
                                                onClick={() => handleStatusChange(button.status as 'RECRUITING' | 'CONTRACTING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED')}
                                                disabled={statusChangeLoading}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                                                    button.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                                        button.color === 'green' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                                            button.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                                                button.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                                                                    button.color === 'red' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                                                        'bg-gray-500 hover:bg-gray-600 text-white'
                                                } ${statusChangeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    fontWeight: '500',
                                                    fontSize: '14px',
                                                    border: 'none',
                                                    cursor: statusChangeLoading ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    opacity: statusChangeLoading ? 0.5 : 1
                                                }}
                                            >
                                                <span>{button.icon}</span>
                                                <span>{button.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        } else if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
                            return (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg" style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                                    <p className="text-gray-600 text-center" style={{ color: '#4b5563', textAlign: 'center' }}>
                                        {project.status === 'COMPLETED' ? '✅ 완료된 프로젝트입니다.' : '❌ 취소된 프로젝트입니다.'}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* 기본 관리 버튼들 */}
                    <div className="flex flex-col sm:flex-row gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => router.push(`/user-projects/${params.managerId}/${params.projectId}/edit`)}
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
                        <button
                            onClick={async () => {
                                if (window.confirm(`"${project.title}" 프로젝트를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
                                    try {
                                        console.log('프로젝트 삭제 시작:', project.id);
                                        console.log('managerId:', params.managerId);

                                        // 먼저 DELETE API 시도
                                        const deleteUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${project.id}?requesterId=${params.managerId}`;
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
                                            router.push(`/user-projects/${params.managerId}`);
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
                                                    changedById: Number(params?.managerId)
                                                }),
                                            });

                                            if (statusResponse.ok) {
                                                console.log('프로젝트 취소 성공');
                                                alert('프로젝트가 취소되었습니다.');
                                                router.push(`/user-projects/${params.managerId}`);
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
                            프로젝트 삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProjectDetailPage;
