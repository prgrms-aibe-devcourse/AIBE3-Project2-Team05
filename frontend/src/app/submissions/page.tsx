'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { apiClient } from '@/global/backend/client'
import { Card } from '@/ui/card'
import { Button } from '@/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChatModal } from '@/components/ChatModal'

interface Submission {
  id: number
  projectId: number
  projectTitle: string
  freelancerName: string
  coverLetter: string
  proposedRate: number
  estimatedDuration: number
  status: string
  appliedAt: string
  pmId?: number
  pmName?: string
}

interface Project {
  id: number
  title: string
  pmId: number
  pmName: string
}

export default function SubmissionsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [freelancerId, setFreelancerId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [chatTarget, setChatTarget] = useState<{
    freelancerId: number
    receiverId: number
    receiverName: string
    projectId: number
    projectTitle: string
  } | null>(null)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)

  // Freelancer 여부 확인
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
          // RsData 응답: resultCode가 200으로 시작하면 프리랜서
          const isSuccess = data.resultCode?.startsWith('200')
          setIsFreelancer(isSuccess)
        } else {
          setIsFreelancer(false)
        }
      } catch {
        setIsFreelancer(false)
      }
    }

    checkRole()
  }, [user, authLoading])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/members/login')
      return
    }

    // isFreelancer가 null이면 아직 역할 확인 중
    if (isFreelancer === null) {
      return
    }

    if (!authLoading && user && isFreelancer === false) {
      router.push('/')
      return
    }

    if (!authLoading && user && isFreelancer === true) {
      loadSubmissions()
    }
  }, [user, authLoading, isFreelancer, router])

  const loadSubmissions = async () => {
    try {
      const [submissionsRes, projectsRes, freelancerRes] = await Promise.all([
        apiClient.get<Submission[]>('/api/v1/submissions'),
        apiClient.get<Project[]>('/api/projects'),
        apiClient.get<{ id: number }>('/api/v1/freelancers/me')
      ])
      setSubmissions(submissionsRes.data)
      setProjects(projectsRes.data)
      setFreelancerId(freelancerRes.data.id)
    } catch (error) {
      console.error('Failed to load submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = (submission: Submission) => {
    const project = projects.find(p => p.id === submission.projectId)
    if (!project) {
      alert('프로젝트 정보를 찾을 수 없습니다.')
      return
    }

    if (!freelancerId) {
      alert('프리랜서 정보를 찾을 수 없습니다.')
      return
    }

    setChatTarget({
      freelancerId: freelancerId,
      receiverId: project.pmId,  // 프리랜서가 PM에게 메시지 보냄
      receiverName: project.pmName,
      projectId: submission.projectId,
      projectTitle: submission.projectTitle
    })
    setChatModalOpen(true)
  }

  const handleCancel = async (id: number) => {
    if (!confirm('지원을 취소하시겠습니까?')) return

    try {
      await apiClient.delete(`/api/v1/submissions/${id}`)
      alert('지원이 취소되었습니다.')
      loadSubmissions()
    } catch (error) {
      alert(error instanceof Error ? error.message : '취소 실패')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, className: string }> = {
      'PENDING': { label: '검토중', className: 'bg-yellow-100 text-yellow-800' },
      'ACCEPTED': { label: '승인됨', className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: '거절됨', className: 'bg-red-100 text-red-800' },
      'CANCELED': { label: '취소됨', className: 'bg-gray-100 text-gray-800' },
    }
    const info = statusMap[status] || { label: status, className: 'bg-gray-100' }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${info.className}`}>
        {info.label}
      </span>
    )
  }

  if (authLoading || isLoading || isFreelancer === null) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">내 지원 목록</h1>
        <Link href="/projects">
          <Button>프로젝트 둘러보기</Button>
        </Link>
      </div>

      {submissions.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p className="mb-4">아직 지원한 프로젝트가 없습니다.</p>
          <p className="text-sm">프로젝트 목록에서 관심있는 프로젝트에 지원해보세요!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link
                    href={`/matching/${submission.projectId}`}
                    className="text-xl font-semibold hover:text-primary"
                  >
                    {submission.projectTitle}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    지원일: {new Date(submission.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(submission.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">희망 단가:</span>
                  <span className="ml-2 font-semibold">{submission.proposedRate}만원/월</span>
                </div>
                <div>
                  <span className="text-muted-foreground">예상 기간:</span>
                  <span className="ml-2">{submission.estimatedDuration}일</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">지원 동기:</p>
                <p className="text-sm line-clamp-2">{submission.coverLetter}</p>
              </div>

              <div className="flex gap-2 justify-end">
                {submission.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/submissions/${submission.id}/edit`)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(submission.id)}
                    >
                      취소
                    </Button>
                  </>
                )}
                {submission.status === 'ACCEPTED' && (
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(submission)}
                  >
                    💬 메시지 보내기
                  </Button>
                )}
              </div>
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
