'use client'

import { ChatModal } from '@/components/ChatModal'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { apiClient } from '@/global/backend/client'
import '@/styles/applications-messages.css'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProjectListItem {
  id: number
  title: string
  description: string
  status: string
  applicantCount: number
}

interface Submission {
  id: number
  projectId: number
  projectTitle: string
  freelancerId: number
  freelancerName: string
  coverLetter: string
  proposedRate: number
  estimatedDuration: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
}

export default function ApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [chatTarget, setChatTarget] = useState<{
    freelancerId: number
    receiverId: number
    receiverName: string
    projectId: number
    projectTitle: string
  } | null>(null)

  // PM 여부 확인
  useEffect(() => {
    const checkRole = async () => {
      if (!user || authLoading) return

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me`,
          { credentials: 'include' }
        )

        if (res.ok) {
          const data = await res.json()
          const isFreelancerUser = data.resultCode?.startsWith('200')
          setIsFreelancer(isFreelancerUser)

          if (isFreelancerUser) {
            alert('PM만 접근 가능한 페이지입니다.')
            router.push('/')
          }
        } else {
          setIsFreelancer(false)
        }
      } catch {
        setIsFreelancer(false)
      }
    }

    checkRole()
  }, [user, authLoading, router])

  // 프로젝트 로드
  useEffect(() => {
    if (!authLoading && user && isFreelancer === false) {
      loadProjects()
    }
  }, [user, authLoading, isFreelancer])

  const loadProjects = async () => {
    try {
      if (!user) return

      // PM의 프로젝트 목록 조회
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/manager/${user.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const projectList = data.content || []
        setProjects(projectList)

        // 첫 번째 프로젝트 자동 선택
        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id)
          loadSubmissions(projectList[0].id)
        }
      } else {
        console.error('Failed to load projects:', response.status)
        setProjects([])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubmissions = async (projectId: number) => {
    try {
      setIsLoading(true)
      const response = await apiClient.get<Submission[]>(
        `/api/v1/submissions?projectId=${projectId}`
      )
      setSubmissions(response.data)
    } catch (error) {
      console.error('Failed to load submissions:', error)
      setSubmissions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectChange = (projectId: number) => {
    setSelectedProjectId(projectId)
    loadSubmissions(projectId)
  }

  const handleAccept = async (submissionId: number) => {
    if (!confirm('이 지원을 수락하시겠습니까?')) return

    try {
      await apiClient.put(`/api/v1/submissions/${submissionId}/status`, {
        status: 'ACCEPTED'
      })
      alert('지원이 수락되었습니다.')
      if (selectedProjectId) {
        loadSubmissions(selectedProjectId)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '수락 실패')
    }
  }

  const handleReject = async (submissionId: number) => {
    if (!confirm('이 지원을 거절하시겠습니까?')) return

    try {
      await apiClient.put(`/api/v1/submissions/${submissionId}/status`, {
        status: 'REJECTED'
      })
      alert('지원이 거절되었습니다.')
      if (selectedProjectId) {
        loadSubmissions(selectedProjectId)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '거절 실패')
    }
  }

  const handleSendMessage = (submission: Submission) => {
    const project = projects.find(p => p.id === selectedProjectId)
    if (!project) return

    setChatTarget({
      freelancerId: submission.freelancerId,
      receiverId: submission.freelancerId,  // PM이 프리랜서에게 메시지 보냄
      receiverName: submission.freelancerName,
      projectId: submission.projectId,
      projectTitle: submission.projectTitle
    })
    setChatModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-800' },
      ACCEPTED: { label: '수락됨', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: '거절됨', className: 'bg-red-100 text-red-800' }
    }
    const statusInfo = statusMap[status] || { label: status, className: '' }
    return (
      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
    )
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-page">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-page">
        <h1 className="text-3xl font-bold mb-6">지원자 관리</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2">프로젝트가 없습니다</h2>
            <p className="text-muted-foreground mb-4">
              먼저 프로젝트를 생성해주세요.
            </p>
            <Button onClick={() => router.push('/projects')}>
              프로젝트 목록으로
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-page">
      <h1 className="text-3xl font-bold mb-6">지원자 관리</h1>

      {/* 프로젝트 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">프로젝트 선택</label>
        <select
          value={selectedProjectId || ''}
          onChange={(e) => handleProjectChange(Number(e.target.value))}
          className="w-full md:w-96 px-4 py-2 border border-border rounded-md bg-background"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title} ({project.applicantCount || 0}명 지원)
            </option>
          ))}
        </select>
      </div>

      {/* 지원자 목록 */}
      {submissions.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-semibold mb-2">지원자가 없습니다</h2>
            <p className="text-muted-foreground">
              아직 이 프로젝트에 지원한 프리랜서가 없습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {submission.freelancerName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(submission.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 자기소개서 */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">자기소개서</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {submission.coverLetter}
                  </p>
                </div>

                {/* 제안 정보 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">제안 단가:</span>{' '}
                    {submission.proposedRate.toLocaleString()}원/시간
                  </div>
                  <div>
                    <span className="font-semibold">예상 기간:</span>{' '}
                    {submission.estimatedDuration}일
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-2">
                  {submission.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => handleAccept(submission.id)}
                        className="flex-1"
                      >
                        수락
                      </Button>
                      <Button
                        onClick={() => handleReject(submission.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        거절
                      </Button>
                    </>
                  )}
                  {submission.status === 'ACCEPTED' && (
                    <Button
                      onClick={() => handleSendMessage(submission)}
                      className="flex-1"
                    >
                      💬 메시지 보내기
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {chatTarget && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          projectId={chatTarget.projectId}
          freelancerId={chatTarget.freelancerId}
          receiverId={chatTarget.receiverId}
          receiverName={chatTarget.receiverName}
          projectTitle={chatTarget.projectTitle}
        />
      )}
    </div>
  )
}
