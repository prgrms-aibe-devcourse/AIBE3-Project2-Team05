'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/app/context/UserContext'
import { apiClient } from '@/lib/backend/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChatModal } from '@/components/ChatModal'

interface Submission {
  id: number
  projectId: number
  projectTitle: string
  freelancerName: string
  freelancerMemberId?: number  // 프리랜서의 회원 ID (백엔드 추가 대기)
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

// 인라인 LoadingSpinner 컴포넌트
function InlineLoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid #16a34a',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#666', fontSize: '16px' }}>로딩 중...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function SubmissionsPage() {
  const { user, roles, isLoading: authLoading } = useUser()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [freelancerId, setFreelancerId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [chatTarget, setChatTarget] = useState<{
    submissionId: number
    freelancerId: number
    receiverId: number
    receiverName: string
    projectId: number
    projectTitle: string
  } | null>(null)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)

  // Freelancer 여부 확인 (roles 기반)
  useEffect(() => {
    if (authLoading || !user) return

    const hasFreelancerRole = roles.includes('FREELANCER')
    setIsFreelancer(hasFreelancerRole)
    console.log('[Submissions] Freelancer role check:', { roles, hasFreelancerRole })
  }, [user, authLoading, roles])

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

    console.log('[Submissions Debug] Opening chat:', {
      submissionId: submission.id,
      freelancerId: freelancerId,
      receiverId: project.pmId,
      pmName: project.pmName
    })

    setChatTarget({
      submissionId: submission.id,
      freelancerId: freelancerId,
      receiverId: project.pmId,
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

  // 상태별 배지 스타일 반환
  const getStatusStyle = (status: string) => {
    const styles = {
      PENDING: {
        background: '#fef3c7',
        color: '#92400e',
        label: '검토중'
      },
      ACCEPTED: {
        background: '#d1fae5',
        color: '#065f46',
        label: '승인됨'
      },
      REJECTED: {
        background: '#fee2e2',
        color: '#991b1b',
        label: '거절됨'
      },
      CANCELED: {
        background: '#f3f4f6',
        color: '#374151',
        label: '취소됨'
      }
    }
    return styles[status as keyof typeof styles] || { background: '#f3f4f6', color: '#374151', label: status }
  }

  if (authLoading || isLoading || isFreelancer === null || isFreelancer === undefined) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '64px 16px'
      }}>
        <InlineLoadingSpinner />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f5ec',
      fontFamily: "'Pretendard', 'Inter', Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 16px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#333',
            letterSpacing: '-1px',
            margin: 0
          }}>
            내 지원 목록
          </h1>
          <Link href="/projects">
            <button style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#15803d'}
            onMouseOut={(e) => e.currentTarget.style.background = '#16a34a'}
            >
              프로젝트 둘러보기
            </button>
          </Link>
        </div>

        {/* Empty State */}
        {submissions.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: '13px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            padding: '64px 32px',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#666',
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              아직 지원한 프로젝트가 없습니다.
            </p>
            <p style={{
              fontSize: '14px',
              color: '#999'
            }}>
              프로젝트 목록에서 관심있는 프로젝트에 지원해보세요!
            </p>
          </div>
        ) : (
          /* Submission Cards */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {submissions.map((submission) => {
              const statusStyle = getStatusStyle(submission.status)

              return (
                <div key={submission.id} style={{
                  background: '#fff',
                  borderRadius: '13px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  padding: '24px 28px'
                }}>
                  {/* Card Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <Link
                        href={`/matching/${submission.projectId}`}
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#222',
                          textDecoration: 'none',
                          transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#16a34a'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#222'}
                      >
                        {submission.projectTitle}
                      </Link>
                      <p style={{
                        fontSize: '14px',
                        color: '#666',
                        marginTop: '4px'
                      }}>
                        지원일: {new Date(submission.appliedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    {/* Status Badge */}
                    <span style={{
                      background: statusStyle.background,
                      color: statusStyle.color,
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>희망 단가:</span>
                      <span style={{
                        marginLeft: '8px',
                        fontWeight: 600,
                        color: '#222'
                      }}>
                        {submission.proposedRate}만원/월
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>예상 기간:</span>
                      <span style={{ marginLeft: '8px', color: '#374151' }}>
                        {submission.estimatedDuration}일
                      </span>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      지원 동기:
                    </p>
                    <p style={{
                      fontSize: '15px',
                      color: '#555',
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {submission.coverLetter}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                  }}>
                    {submission.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => router.push(`/submissions/${submission.id}/edit`)}
                          style={{
                            background: '#fff',
                            border: '1px solid #d1d5db',
                            color: '#374151',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                            e.currentTarget.style.borderColor = '#9ca3af'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#fff'
                            e.currentTarget.style.borderColor = '#d1d5db'
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleCancel(submission.id)}
                          style={{
                            background: '#fff',
                            border: '1px solid #d1d5db',
                            color: '#374151',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                            e.currentTarget.style.borderColor = '#9ca3af'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#fff'
                            e.currentTarget.style.borderColor = '#d1d5db'
                          }}
                        >
                          취소
                        </button>
                      </>
                    )}
                    {submission.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleSendMessage(submission)}
                        style={{
                          background: '#16a34a',
                          border: 'none',
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#15803d'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#16a34a'}
                      >
                        💬 메시지 보내기
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
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
            relatedType="SUBMISSION"
            relatedId={chatTarget.submissionId}
          />
        )}
      </div>
    </div>
  )
}
