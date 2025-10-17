'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/app/context/UserContext'
import { apiClient } from '@/lib/backend/client'
import Link from 'next/link'

interface Submission {
  id: number
  projectId: number
  projectTitle: string
  coverLetter: string
  proposedRate: number
  estimatedDuration: number
  status: string
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

export default function EditSubmissionPage() {
  const params = useParams()
  const submissionId = Number(params.id)
  const router = useRouter()
  const { user, roles, isLoading: authLoading } = useUser()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)

  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')

  // Freelancer 여부 확인 (roles 기반)
  useEffect(() => {
    if (authLoading || !user) return

    const hasFreelancerRole = roles.includes('FREELANCER')
    setIsFreelancer(hasFreelancerRole)
    console.log('[SubmissionEdit] Freelancer role check:', { roles, hasFreelancerRole })
  }, [user, authLoading, roles])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/members/login')
      return
    }

    if (isFreelancer === null) {
      return
    }

    if (!authLoading && user && isFreelancer === false) {
      alert('프리랜서만 접근할 수 있습니다.')
      router.push('/')
      return
    }

    if (!authLoading && user && isFreelancer === true) {
      loadSubmission()
    }
  }, [submissionId, authLoading, user, isFreelancer, router])

  const loadSubmission = async () => {
    try {
      const response = await apiClient.get<Submission>(`/api/v1/submissions/${submissionId}`)
      const data = response.data

      if (data.status !== 'PENDING') {
        alert('대기 중인 지원서만 수정할 수 있습니다.')
        router.push('/submissions')
        return
      }

      setSubmission(data)
      setCoverLetter(data.coverLetter)
      setProposedRate(String(data.proposedRate))
      setEstimatedDuration(String(data.estimatedDuration))
    } catch (error) {
      console.error('Failed to load submission:', error)
      alert('지원서를 불러오지 못했습니다.')
      router.push('/submissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!coverLetter || !proposedRate || !estimatedDuration) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    if (coverLetter.length < 5) {
      alert('자기소개서는 최소 5자 이상 작성해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      await apiClient.put(`/api/v1/submissions/${submissionId}`, {
        coverLetter,
        proposedRate: Number(proposedRate),
        estimatedDuration: Number(estimatedDuration),
        portfolio: []
      })

      alert('지원서가 수정되었습니다!')
      router.push('/submissions')
    } catch (error) {
      alert(error instanceof Error ? error.message : '수정 실패')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading || isFreelancer === null || isFreelancer === undefined) {
    return (
      <div style={{
        maxWidth: '768px',
        margin: '0 auto',
        padding: '64px 16px'
      }}>
        <InlineLoadingSpinner />
      </div>
    )
  }

  if (!submission) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f5ec',
      fontFamily: "'Pretendard', 'Inter', Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: '768px',
        margin: '0 auto',
        padding: '40px 16px'
      }}>
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/submissions"
            style={{
              color: '#16a34a',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 500,
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            ← 내 지원 목록으로
          </Link>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#333',
          letterSpacing: '-1px',
          marginBottom: '32px'
        }}>
          지원서 수정
        </h1>

        {/* Project Info Card */}
        <div style={{
          background: '#fff',
          borderRadius: '13px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          padding: '24px 28px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#222',
            marginBottom: '8px'
          }}>
            {submission.projectTitle}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            이 프로젝트에 대한 지원서를 수정합니다.
          </p>
        </div>

        {/* Edit Form Card */}
        <div style={{
          background: '#fff',
          borderRadius: '13px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          padding: '24px 28px'
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Cover Letter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                지원 동기 및 자기소개 * (최소 5자)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="프로젝트에 지원하는 이유와 자신의 경력, 강점을 소개해주세요. (최소 5자)"
                required
                minLength={5}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  lineHeight: '1.6'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#16a34a'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
              <div style={{
                fontSize: '12px',
                color: coverLetter.length < 5 ? '#dc2626' : '#999',
                marginTop: '4px'
              }}>
                {coverLetter.length}자 {coverLetter.length < 5 && '(최소 5자 필요)'}
              </div>
            </div>

            {/* Rate and Duration */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  희망 단가 (만원/월) *
                </label>
                <input
                  type="number"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder="예: 500"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  예상 작업 기간 (일) *
                </label>
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="예: 60"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  flex: 1,
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '15px',
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
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: isSubmitting ? '#9ca3af' : '#16a34a',
                  border: 'none',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  opacity: isSubmitting ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#15803d'
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#16a34a'
                }}
              >
                {isSubmitting ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
