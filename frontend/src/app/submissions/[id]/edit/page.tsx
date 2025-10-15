'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/app/context/UserContext'
import { apiClient } from '@/lib/backend/client'
import { Card } from '@/ui/card'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
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

export default function EditSubmissionPage() {
  const params = useParams()
  const submissionId = Number(params.id)
  const router = useRouter()
  const { user, isLoading: authLoading } = useUser()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)

  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')

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

  if (authLoading || isLoading || isFreelancer === null) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!submission) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/submissions" className="text-primary hover:underline">
          ← 내 지원 목록으로
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">지원서 수정</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{submission.projectTitle}</h2>
        <p className="text-sm text-muted-foreground">
          이 프로젝트에 대한 지원서를 수정합니다.
        </p>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              지원 동기 및 자기소개 * (최소 5자)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full min-h-[200px] p-3 border rounded-md"
              placeholder="프로젝트에 지원하는 이유와 자신의 경력, 강점을 소개해주세요. (최소 5자)"
              required
              minLength={5}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {coverLetter.length}자 {coverLetter.length < 5 && `(최소 5자 필요)`}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                희망 단가 (만원/월) *
              </label>
              <Input
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                placeholder="예: 500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                예상 작업 기간 (일) *
              </label>
              <Input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="예: 60"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
