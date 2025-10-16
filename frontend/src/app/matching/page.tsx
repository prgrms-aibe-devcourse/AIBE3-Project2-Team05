'use client'

import { useUser } from '@/app/context/UserContext'
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  List,
  Send,
  Star,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProjectSummary {
  id: number
  title: string
  status?: string
  applicantCount?: number
  deadline?: string
}

interface ApplicantSummary {
  id: number
  freelancerName: string
  skills?: string
  experience?: string
  status: string
  projectTitle?: string
  createdAt?: string
}

interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalApplicants: number
  newApplicants: number
  unreadMessages: number
}

interface MatchedProject {
  projectId: number
  projectTitle: string
  projectDescription?: string
  matchingScore: number
  requiredSkills?: string[]
  budgetRange?: string
  duration?: string
  companyName?: string
  deadline?: string
  hasApplied?: boolean
  matchingReasons?: {
    skillsMatch?: string
    experienceMatch?: string
    budgetMatch?: string
  }
}

export default function MatchingDashboardPage() {
  const router = useRouter()
  const { user, roles, isLoading: authLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'applicants' | 'messages'>('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalApplicants: 0,
    newApplicants: 0,
    unreadMessages: 0
  })
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [applicants, setApplicants] = useState<ApplicantSummary[]>([])

  // 역할 상태 관리
  const [userRole, setUserRole] = useState<'freelancer' | 'pm' | 'both' | 'none' | null>(null)
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'pm' | null>(null)
  const [showRoleSelectModal, setShowRoleSelectModal] = useState(false)
  const [hasFreelancerProfile, setHasFreelancerProfile] = useState(false)

  // 역할 체크 (roles 배열 기반)
  useEffect(() => {
    if (authLoading || !user) return

    const hasFreelancerRole = roles.includes('FREELANCER')
    const hasPMRole = roles.includes('PM')

    console.log('[Matching] User roles:', { roles, hasFreelancerRole, hasPMRole })

    if (hasFreelancerRole && hasPMRole) {
      // 둘 다 있으면 세션 스토리지에서 마지막 선택 확인
      const savedRole = sessionStorage.getItem('selectedDashboardRole') as 'freelancer' | 'pm' | null
      if (savedRole === 'freelancer' || savedRole === 'pm') {
        setUserRole('both')
        setSelectedRole(savedRole)
        console.log('[Matching] Both roles, loaded saved selection:', savedRole)
      } else {
        // 저장된 선택이 없으면 모달 표시
        setUserRole('both')
        setShowRoleSelectModal(true)
        console.log('[Matching] Both roles, showing modal')
      }
    } else if (hasFreelancerRole) {
      setUserRole('freelancer')
      setSelectedRole('freelancer')
      console.log('[Matching] Freelancer role only')
    } else if (hasPMRole) {
      setUserRole('pm')
      setSelectedRole('pm')
      console.log('[Matching] PM role only')
    } else {
      // 둘 다 없음
      setUserRole('none')
      console.log('[Matching] No PM or Freelancer role')
    }
  }, [user, authLoading, roles])

  // 프리랜서 프로필 확인
  useEffect(() => {
    const checkFreelancerProfile = async () => {
      if (!user || authLoading) return
      if (userRole !== 'freelancer' && selectedRole !== 'freelancer') return

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me`,
          { credentials: 'include' }
        )

        if (res.ok) {
          const data = await res.json()
          // id 필드가 있고 freelancerTitle 등 프리랜서 관련 필드가 있으면 프리랜서 프로필 존재
          const hasProfile = data && typeof data === 'object' && data.id && 'freelancerTitle' in data
          setHasFreelancerProfile(hasProfile)
          console.log('[Matching] Freelancer profile check:', { hasProfile, data })
        } else {
          setHasFreelancerProfile(false)
          console.log('[Matching] Freelancer profile not found:', res.status)
        }
      } catch (error) {
        console.error('[Matching] Freelancer profile check error:', error)
        setHasFreelancerProfile(false)
      }
    }

    checkFreelancerProfile()
  }, [user, authLoading, userRole, selectedRole])

  // 대시보드 데이터 로드
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요한 서비스입니다.')
      router.push('/members/login')
      return
    }

    // userRole이 null이면 아직 역할 확인 중
    if (userRole === null) {
      return
    }

    // PM 대시보드 로드
    if (user && (selectedRole === 'pm' || userRole === 'pm')) {
      void loadDashboardData()
    } else if (user && (selectedRole === 'freelancer' || userRole === 'freelancer')) {
      setLoading(false)
    } else if (userRole === 'none') {
      setLoading(false)
    }
  }, [authLoading, user, userRole, selectedRole, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      if (!user?.id) {
        console.error('User ID not available')
        setLoading(false)
        return
      }

      // PM의 프로젝트만 조회 (팀 표준 API - fetch 직접 사용)
      const projectsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/manager/${user.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const projectsData = projectsRes.ok ? await projectsRes.json() : { content: [], totalElements: 0 }
      const projectList = projectsData.content || []

      // 모든 프로젝트의 지원자 정보 수집
      const allSubmissions: ApplicantSummary[] = []

      // 각 프로젝트별로 지원자 조회
      await Promise.all(
        projectList.map(async (project: any) => {
          try {
            const submissionsRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/submissions?projectId=${project.id}`,
              { credentials: 'include' }
            )

            if (submissionsRes.ok) {
              const submissionsData = await submissionsRes.json()
              const submissions = submissionsData.data || []

              // 각 지원자를 ApplicantSummary 형식으로 변환
              for (const submission of submissions) {
                // 프리랜서 기술 정보 조회 (선택적)
                let skills = ''
                try {
                  const techsRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/${submission.freelancerId}/techs`,
                    { credentials: 'include' }
                  )
                  if (techsRes.ok) {
                    const techsData = await techsRes.json()
                    const techs = techsData.data || []
                    skills = techs.slice(0, 3).map((t: any) => t.techName).join(', ')
                  }
                } catch (err) {
                  console.error(`Failed to fetch techs for freelancer ${submission.freelancerId}:`, err)
                }

                allSubmissions.push({
                  id: submission.id,
                  freelancerName: submission.freelancerName || '이름 없음',
                  skills: skills || `제안단가: ${submission.proposedRate?.toLocaleString()}원/월`,
                  experience: submission.estimatedDuration ? `${submission.estimatedDuration}개월` : '기간 미정',
                  status: submission.status || 'PENDING',
                  projectTitle: submission.projectTitle || project.title,
                  createdAt: submission.createdAt
                })
              }
            }
          } catch (error) {
            console.error(`Failed to load submissions for project ${project.id}:`, error)
          }
        })
      )

      // 최신순 정렬 후 상위 5개만 선택
      const applicantList = allSubmissions
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5)

      const unreadMessages = 0

      setProjects(projectList)
      setApplicants(applicantList)

      setStats({
        totalProjects: projectList.length,
        activeProjects: projectList.filter((p) => p.status === 'RECRUITING' || p.status === 'IN_PROGRESS').length,
        totalApplicants: projectList.reduce((sum, p) => sum + (p.applicantCount || 0), 0),
        newApplicants: applicantList.filter((a) => a.status === 'PENDING' || a.status === 'NEW').length,
        unreadMessages
      })

      console.log(`Loaded ${projectList.length} projects for manager ${user.id}`)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 역할 선택 모달 핸들러
  const handleRoleSelect = (role: 'freelancer' | 'pm') => {
    setSelectedRole(role)
    sessionStorage.setItem('selectedDashboardRole', role)
    setShowRoleSelectModal(false)
    console.log('[Matching] Role selected:', role)
  }

  // 로딩 중
  if (authLoading || userRole === null || loading) {
    return (
      <div className="bg-gray-100 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>대시보드를 불러오는 중입니다…</p>
          </div>
        </div>
      </div>
    )
  }

  // 권한 없음 (PM도 프리랜서도 아님)
  if (userRole === 'none') {
    return (
      <div className="bg-gray-100 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <img
              src="/logo-full.png"
              alt="접근 권한 없음"
              style={{ width: '200px', height: 'auto', margin: '0 auto 24px', display: 'block' }}
            />
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              접근 권한이 없습니다
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
              매칭 대시보드는 PM 또는 프리랜서 역할이 있는 사용자만 이용할 수 있습니다.<br />
              관리자에게 문의하거나 프로필을 등록해 주세요.
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 역할 선택 모달 (둘 다 있을 때)
  if (userRole === 'both' && showRoleSelectModal) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
            대시보드 선택
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '32px', textAlign: 'center' }}>
            PM과 프리랜서 역할을 모두 가지고 계십니다.<br />
            어떤 대시보드를 보시겠습니까?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleRoleSelect('freelancer')}
              style={{
                padding: '16px',
                backgroundColor: '#eff6ff',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e40af'
              }}
            >
              프리랜서 대시보드
            </button>
            <button
              onClick={() => handleRoleSelect('pm')}
              style={{
                padding: '16px',
                backgroundColor: '#f0fdf4',
                border: '2px solid #16a34a',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                color: '#166534'
              }}
            >
              PM 대시보드
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 프리랜서 역할인데 프로필이 없는 경우
  if ((selectedRole === 'freelancer' || userRole === 'freelancer') && !hasFreelancerProfile) {
    return (
      <div className="bg-gray-100 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>📝</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              프리랜서 프로필 등록 필요
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
              프리랜서 매칭 대시보드를 이용하려면<br />
              먼저 프리랜서 프로필을 등록해야 합니다.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                나중에
              </button>
              <button
                onClick={() => router.push('/freelancers/create')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                프로필 등록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 프리랜서용 대시보드
  if (selectedRole === 'freelancer' || userRole === 'freelancer') {
    return <FreelancerMatchingDashboard user={user} router={router} />
  }

  // PM 대시보드

  return (
    <div className="bg-gray-100 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <main className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* 타이틀 섹션 */}
        <div className="mb-8" style={{ marginBottom: '32px' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
            PM 대시보드
          </h2>
          <p className="text-gray-600" style={{ color: '#6b7280' }}>
            프로젝트와 지원자를 효율적으로 관리하세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6" style={{ backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid #f3f4f6', marginBottom: '24px' }}>
          <div className="border-b border-gray-200" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <nav className="flex gap-8 px-6" style={{ display: 'flex', gap: '32px', padding: '0 24px' }}>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 font-medium transition ${
                  activeTab === 'overview'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  padding: '16px 0',
                  border: 'none',
                  color: activeTab === 'overview' ? '#2563eb' : '#6b7280',
                  fontWeight: 500,
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 font-medium transition ${
                  activeTab === 'projects'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  padding: '16px 0',
                  border: 'none',
                  color: activeTab === 'projects' ? '#2563eb' : '#6b7280',
                  fontWeight: 500,
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                내 프로젝트
              </button>
              <button
                onClick={() => {
                  setActiveTab('applicants')
                  router.push('/applications')
                }}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === 'applicants'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  padding: '16px 0',
                  borderBottom: activeTab === 'applicants' ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeTab === 'applicants' ? '#2563eb' : '#6b7280',
                  fontWeight: 500,
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                지원자 관리
              </button>
              <button
                onClick={() => {
                  setActiveTab('messages')
                  router.push('/messages')
                }}
                className={`py-4 border-b-2 font-medium transition relative ${
                  activeTab === 'messages'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  padding: '16px 0',
                  borderBottom: activeTab === 'messages' ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeTab === 'messages' ? '#2563eb' : '#6b7280',
                  fontWeight: 500,
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                메시지
                {stats.unreadMessages > 0 && (
                  <span
                    className="absolute -top-1 -right-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full"
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      padding: '2px 8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '9999px'
                    }}
                  >
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* 프로젝트 섹션 - 통합 */}
            <div
            className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100"
            style={{
              gridColumn: 'span 2',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #f3f4f6'
            }}
          >
            <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 className="text-xl font-bold text-gray-900" style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                  내 프로젝트
                </h3>
                <p className="text-sm text-gray-500 mt-1" style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  총 {stats.totalProjects}개 프로젝트
                </p>
              </div>
            </div>

            {/* 프로젝트 목록 */}
            <div className="space-y-4 mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                  프로젝트를 등록해주세요
                </div>
              ) : (
                projects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
                    style={{
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => router.push(`/matching/${project.id}`)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#93c5fd'
                      e.currentTarget.style.backgroundColor = '#eff6ff'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div className="flex justify-between items-start mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 className="font-semibold text-gray-900" style={{ fontWeight: 600, color: '#111827' }}>
                        {project.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === '진행중'
                            ? 'bg-green-100 text-green-700'
                            : project.status === '모집중'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: project.status === 'IN_PROGRESS' ? '#dcfce7' : project.status === 'RECRUITING' ? '#dbeafe' : '#f3f4f6',
                          color: project.status === 'IN_PROGRESS' ? '#166534' : project.status === 'RECRUITING' ? '#1e40af' : '#374151'
                        }}
                      >
                        {project.status === 'IN_PROGRESS' ? '진행중' : project.status === 'RECRUITING' ? '모집중' : '완료'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                      <span className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                        {project.applicantCount ?? 0}명 지원
                      </span>
                      {project.deadline && (
                        <span className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                          마감: {project.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button
                className="flex items-center justify-center gap-2 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-medium"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  border: '2px solid #16a34a',
                  color: '#16a34a',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setActiveTab('projects')}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dcfce7')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                <List className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
                전체 프로젝트 목록
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => router.push('/projects/create')}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <Briefcase className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
                새 프로젝트
              </button>
            </div>
          </div>

          {/* 지원자 섹션 - 통합 */}
          <div
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #f3f4f6'
            }}
          >
            <div className="mb-6" style={{ marginBottom: '24px' }}>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                지원자 관리
              </h3>
              <p className="text-sm text-gray-500 mt-1" style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                총 {stats.totalApplicants}명 지원
              </p>
            </div>

            {/* 지원자 목록 */}
            <div className="space-y-4 mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {applicants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                  지원자가 없습니다
                </div>
              ) : (
                applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition cursor-pointer"
                    style={{
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => router.push('/applications')}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#d8b4fe'
                      e.currentTarget.style.backgroundColor = '#faf5ff'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <h4 className="font-semibold text-gray-900" style={{ fontWeight: 600, color: '#111827' }}>
                          {applicant.freelancerName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {applicant.projectTitle || '프로젝트 미지정'}
                        </p>
                      </div>
                      {(applicant.status === 'PENDING' || applicant.status === 'NEW') && (
                        <span
                          className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded"
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ffedd5',
                            color: '#ea580c',
                            fontSize: '11px',
                            fontWeight: 500,
                            borderRadius: '4px'
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2" style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      {applicant.skills || '기술 정보 없음'}
                    </p>
                    <div className="flex items-center justify-between text-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span className="text-gray-500" style={{ color: '#6b7280' }}>
                        경력: {applicant.experience || '경력 정보 없음'}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          applicant.status === 'ACCEPTED'
                            ? 'text-green-600'
                            : applicant.status === 'PENDING'
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: applicant.status === 'ACCEPTED' ? '#16a34a' : applicant.status === 'PENDING' || applicant.status === 'NEW' ? '#ea580c' : '#6b7280'
                        }}
                      >
                        {applicant.status === 'ACCEPTED' ? (
                          <CheckCircle className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                        ) : (
                          <AlertCircle className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                        )}
                        {applicant.status === 'ACCEPTED'
                          ? '승인됨'
                          : applicant.status === 'PENDING'
                          ? '검토중'
                          : applicant.status === 'NEW'
                          ? '새로운'
                          : '거절됨'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 버튼 */}
            <button
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#16a34a',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => router.push('/applications')}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
            >
              모든 지원자 목록 보기
            </button>
          </div>
          </div>
        )}

        {/* 내 프로젝트 전체 목록 탭 */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100" style={{ backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '12px', padding: '24px', border: '1px solid #f3f4f6' }}>
            <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 className="text-2xl font-bold text-gray-900" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                  내 프로젝트 전체 목록
                </h3>
                <p className="text-sm text-gray-500 mt-1" style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  총 {stats.totalProjects}개 프로젝트 · 프로젝트를 클릭하여 매칭된 프리랜서를 확인하세요
                </p>
              </div>
              <button
                className="flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => router.push('/projects/create')}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <Briefcase className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
                새 프로젝트
              </button>
            </div>

            {/* 전체 프로젝트 목록 */}
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                  프로젝트를 등록해주세요
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
                    style={{
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => router.push(`/matching/${project.id}`)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#93c5fd'
                      e.currentTarget.style.backgroundColor = '#eff6ff'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div className="flex justify-between items-start mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 className="font-semibold text-gray-900" style={{ fontWeight: 600, color: '#111827' }}>
                        {project.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === '진행중'
                            ? 'bg-green-100 text-green-700'
                            : project.status === '모집중'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: project.status === 'IN_PROGRESS' ? '#dcfce7' : project.status === 'RECRUITING' ? '#dbeafe' : '#f3f4f6',
                          color: project.status === 'IN_PROGRESS' ? '#166534' : project.status === 'RECRUITING' ? '#1e40af' : '#374151'
                        }}
                      >
                        {project.status === 'IN_PROGRESS' ? '진행중' : project.status === 'RECRUITING' ? '모집중' : '완료'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                      <span className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                        {project.applicantCount ?? 0}명 지원
                      </span>
                      {project.deadline && (
                        <span className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                          마감: {project.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// 프리랜서용 매칭 대시보드 컴포넌트
function FreelancerMatchingDashboard({ user, router }: { user: { id: number; username: string; role: string } | null; router: ReturnType<typeof useRouter> }) {
  const [loading, setLoading] = useState(true)
  const [matchedProjects, setMatchedProjects] = useState<MatchedProject[]>([])
  const [selectedProject, setSelectedProject] = useState<MatchedProject | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [appliedProjectIds, setAppliedProjectIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadMatchedProjects()
  }, [user])

  // 페이지 포커스 시 데이터 새로고침 (지원 후 돌아왔을 때)
  useEffect(() => {
    const handleFocus = () => {
      console.log('[FreelancerDashboard] Page focused, reloading data')
      loadMatchedProjects()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const loadMatchedProjects = async () => {
    try {
      setLoading(true)

      if (!user) {
        console.log('[FreelancerDashboard] No user found')
        setLoading(false)
        return
      }

      console.log('[FreelancerDashboard] Loading projects for user:', user.id)

      // 0. 내가 지원한 프로젝트 ID 목록 조회
      let appliedIds = new Set<number>()  // 함수 스코프로 선언
      try {
        const submissionsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/submissions`,
          { credentials: 'include' }
        )
        if (submissionsRes.ok) {
          const submissionsData = await submissionsRes.json()
          const submissions = submissionsData.data || []
          appliedIds = new Set(submissions.map((s: any) => s.projectId))
          setAppliedProjectIds(appliedIds)
          console.log('[FreelancerDashboard] Applied project IDs:', Array.from(appliedIds))
        }
      } catch (error) {
        console.error('[FreelancerDashboard] Failed to load submissions:', error)
      }

      // 1. 모든 RECRUITING 상태 프로젝트 조회
      const projectsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects?status=RECRUITING`
      console.log('[FreelancerDashboard] Fetching projects from:', projectsUrl)

      const projectsRes = await fetch(projectsUrl, { credentials: 'include' })

      console.log('[FreelancerDashboard] Projects response status:', projectsRes.status)

      if (!projectsRes.ok) {
        console.error('[FreelancerDashboard] Failed to load projects:', projectsRes.status)
        const errorText = await projectsRes.text()
        console.error('[FreelancerDashboard] Error response:', errorText)
        setMatchedProjects([])
        setLoading(false)
        return
      }

      const projectsData = await projectsRes.json()
      console.log('[FreelancerDashboard] Projects raw data:', projectsData)
      const projects = projectsData.content || []
      console.log('[FreelancerDashboard] Found projects:', projects.length, projects)

      // 2. 각 프로젝트별로 내 매칭 점수 조회 (전체 프로젝트 대상)
      const projectsWithScores = await Promise.all(
        projects.map(async (project: any) => {
          try {
            console.log(`[FreelancerDashboard] Checking matching for project ${project.id}:`, project.title)
            const matchingRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/matching/recommend/${project.id}`,
              { credentials: 'include' }
            )

            if (matchingRes.ok) {
              const matchingData = await matchingRes.json()
              console.log(`[FreelancerDashboard] Project ${project.id} full matching data:`, matchingData)

              // 백엔드는 data.recommendations 배열 안에 매칭 결과를 반환
              const myScore = matchingData.data?.recommendations?.[0]
              console.log(`[FreelancerDashboard] Project ${project.id} score:`, myScore)

              if (myScore) {
                return {
                  projectId: project.id,
                  projectTitle: project.title,
                  projectDescription: project.description,
                  matchingScore: Math.round(myScore.matchingScore || 0),
                  requiredSkills: project.techStacks?.map((t: any) => t.tech?.name).filter(Boolean) || [],
                  budgetRange: project.budgetType || '협의',
                  duration: project.duration || '미정',
                  companyName: project.companyName || '비공개',
                  deadline: project.recruitDeadline || '상시모집',
                  hasApplied: appliedIds.has(project.id),  // 지역 변수 사용 (즉시 반영)
                  matchingReasons: {
                    skillsMatch: `스킬 매칭: ${Math.round(myScore.skillScore || 0)}점`,
                    experienceMatch: `경력 매칭: ${Math.round(myScore.experienceScore || 0)}점`,
                    budgetMatch: `단가 매칭: ${Math.round(myScore.budgetScore || 0)}점`
                  }
                }
              }
            } else {
              console.log(`[FreelancerDashboard] Project ${project.id} matching failed:`, matchingRes.status)
            }
            return null
          } catch (err) {
            console.error(`[FreelancerDashboard] Error getting score for project ${project.id}:`, err)
            return null
          }
        })
      )

      // 3. 점수가 있는 프로젝트만 필터링하고 점수순 정렬 후 TOP 10 선택
      const validProjects = projectsWithScores
        .filter((p): p is MatchedProject => p !== null)
        .sort((a, b) => b.matchingScore - a.matchingScore)

      const top10 = validProjects.slice(0, 10)
      console.log('[FreelancerDashboard] Valid projects with scores:', validProjects.length, ', TOP 10:', top10.length)
      setMatchedProjects(top10)
    } catch (error) {
      console.error('[FreelancerDashboard] Failed to load matched projects:', error)
      setMatchedProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (project: MatchedProject) => {
    setSelectedProject(project)
    setShowApplyModal(true)
  }

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>매칭 프로젝트를 찾는 중입니다…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <main className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* 타이틀 섹션 */}
        <div className="mb-8" style={{ marginBottom: '32px' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
            프리랜서 매칭 대시보드
          </h2>
          <p className="text-gray-600" style={{ color: '#6b7280' }}>
            당신의 스킬과 경력에 맞는 프로젝트를 찾아보세요
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/proposals')}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #f3f4f6',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Send className="w-6 h-6 text-blue-600" style={{ width: '24px', height: '24px', color: '#2563eb' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>받은 제안</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>PM이 보낸 제안을 확인하세요</p>
          </button>

          <button
            onClick={() => router.push('/submissions')}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #f3f4f6',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FileText className="w-6 h-6 text-green-600" style={{ width: '24px', height: '24px', color: '#16a34a' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>내 지원 현황</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>지원한 프로젝트를 관리하세요</p>
          </button>

          <button
            onClick={() => router.push('/projects')}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #f3f4f6',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Briefcase className="w-6 h-6 text-purple-600" style={{ width: '24px', height: '24px', color: '#9333ea' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>전체 프로젝트</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>모든 프로젝트를 둘러보세요</p>
          </button>
        </div>

        {/* 매칭 프로젝트 목록 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100" style={{ backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '12px', padding: '24px', border: '1px solid #f3f4f6' }}>
          <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 className="text-2xl font-bold text-gray-900" style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                추천 프로젝트 TOP 10
              </h3>
              <p className="text-sm text-gray-500 mt-1" style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                당신의 스킬과 매칭도가 높은 프로젝트입니다
              </p>
            </div>
          </div>

          {/* 프로젝트 카드 목록 */}
          <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {matchedProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                  매칭된 프로젝트가 없습니다
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                  프로필을 완성하면 더 많은 프로젝트를 추천받을 수 있습니다
                </p>
                <button
                  onClick={() => router.push('/projects')}
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  전체 프로젝트 보기
                </button>
              </div>
            ) : (
              matchedProjects.map((project) => (
                <div
                  key={project.projectId}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-lg transition"
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* 매칭 점수 배지 */}
                  <div className="flex justify-between items-start mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 className="text-lg font-bold text-gray-900 mb-1" style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                        {project.projectTitle}
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontSize: '13px', color: '#6b7280' }}>
                        {project.companyName}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        backgroundColor: project.matchingScore >= 80 ? '#dcfce7' : project.matchingScore >= 60 ? '#fef3c7' : '#fee2e2',
                        color: project.matchingScore >= 80 ? '#166534' : project.matchingScore >= 60 ? '#92400e' : '#991b1b'
                      }}
                    >
                      <Star style={{ width: '20px', height: '20px' }} />
                      <span style={{ fontSize: '16px', fontWeight: 700 }}>{project.matchingScore}점</span>
                    </div>
                  </div>

                  {/* 프로젝트 설명 */}
                  {project.projectDescription && (
                    <p className="text-gray-700 mb-3 text-sm" style={{ color: '#374151', marginBottom: '12px', lineHeight: '1.5', fontSize: '13px' }}>
                      {project.projectDescription}
                    </p>
                  )}

                  {/* 프로젝트 정보 그리드 */}
                  <div className="grid grid-cols-2 gap-3 mb-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    {project.requiredSkills && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>필요 기술</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {project.requiredSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#eff6ff',
                                color: '#1e40af',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 500
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.budgetRange && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>예산</span>
                        <p style={{ fontSize: '14px', color: '#111827', marginTop: '8px', fontWeight: 600 }}>{project.budgetRange}</p>
                      </div>
                    )}
                    {project.duration && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>기간</span>
                        <p style={{ fontSize: '14px', color: '#111827', marginTop: '8px' }}>{project.duration}</p>
                      </div>
                    )}
                    {project.deadline && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>마감일</span>
                        <p style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px', fontWeight: 600 }}>{project.deadline}</p>
                      </div>
                    )}
                  </div>

                  {/* 매칭 이유 */}
                  {project.matchingReasons && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3" style={{ backgroundColor: '#eff6ff', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af', marginBottom: '8px' }}>매칭 이유</h5>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {project.matchingReasons.skillsMatch && (
                          <li style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', paddingLeft: '16px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>✓</span>
                            {project.matchingReasons.skillsMatch}
                          </li>
                        )}
                        {project.matchingReasons.experienceMatch && (
                          <li style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', paddingLeft: '16px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>✓</span>
                            {project.matchingReasons.experienceMatch}
                          </li>
                        )}
                        {project.matchingReasons.budgetMatch && (
                          <li style={{ fontSize: '13px', color: '#374151', paddingLeft: '16px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>✓</span>
                            {project.matchingReasons.budgetMatch}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <button
                    onClick={() => !project.hasApplied && handleApply(project)}
                    disabled={project.hasApplied}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: project.hasApplied ? '#9ca3af' : '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: project.hasApplied ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => !project.hasApplied && (e.currentTarget.style.backgroundColor = '#15803d')}
                    onMouseOut={(e) => !project.hasApplied && (e.currentTarget.style.backgroundColor = '#16a34a')}
                  >
                    {project.hasApplied ? '지원완료' : '지원하기'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 지원하기 모달 (TODO: 구현 필요) */}
      {showApplyModal && selectedProject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          onClick={() => setShowApplyModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
              프로젝트 지원
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {selectedProject.projectTitle}에 지원하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  router.push(`/submissions/create/${selectedProject.projectId}`)
                  setShowApplyModal(false)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                지원하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
