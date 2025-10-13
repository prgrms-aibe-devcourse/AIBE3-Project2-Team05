'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { apiClient } from '@/global/backend/client'
import { Card } from '@/ui/card'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import Link from 'next/link'

interface Project {
  id: number
  title: string
  description: string
  budget: number
  startDate: string
  endDate: string
}

export default function ApplyPage() {
  const params = useParams()
  const projectId = Number(params.projectId)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')

  useEffect(() => {
    if (!authLoading && user?.role !== 'FREELANCER') {
      alert('프리랜서만 지원할 수 있습니다.')
      router.push('/projects')
      return
    }

    if (!authLoading) {
      loadProject()
    }
  }, [projectId, authLoading, user])

  const loadProject = async () => {
    try {
      const response = await apiClient.get<Project[]>('/api/v1/projects')
      const found = response.data.find(p => p.id === projectId)
      if (found) {
        setProject(found)
      } else {
        alert('프로젝트를 찾을 수 없습니다.')
        router.push('/projects')
      }
    } catch (error) {
      console.error('Failed to load project:', error)
      alert('프로젝트 로딩 실패')
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

    try {
      setIsSubmitting(true)
      await apiClient.post('/api/v1/submissions', {
        projectId,
        coverLetter,
        proposedRate: Number(proposedRate),
        estimatedDuration: Number(estimatedDuration),
        portfolio: []
      })

      alert('지원이 완료되었습니다!')
      router.push('/submissions')
    } catch (error: any) {
      alert(error.message || '지원 실패')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/projects" className="text-primary hover:underline">
          ← 프로젝트 목록으로
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">프로젝트 지원</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{project.title}</h2>
        <p className="text-muted-foreground mb-4">{project.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">예산:</span>
            <span className="ml-2 font-semibold">{project.budget?.toLocaleString()}만원</span>
          </div>
          <div>
            <span className="text-muted-foreground">기간:</span>
            <span className="ml-2">{project.startDate} ~ {project.endDate}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              지원 동기 및 자기소개 *
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full min-h-[200px] p-3 border rounded-md"
              placeholder="프로젝트에 지원하는 이유와 자신의 경력, 강점을 소개해주세요."
              required
            />
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
              {isSubmitting ? '지원 중...' : '지원하기'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
