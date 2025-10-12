'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/ui/button'
import { FreelancerCard } from './_components/FreelancerCard'
import { apiClient } from '@/global/backend/client'
import type { RecommendationResponseDto } from '@/global/backend/apiV1/types'

export default function MatchingPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RecommendationResponseDto | null>(null)

  useEffect(() => {
    fetchRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<RecommendationResponseDto>(
        `/api/v1/matching/recommend/${projectId}`
      )

      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '추천 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    try {
      setLoading(true)
      await apiClient.post(`/api/v1/matching/recommend/${projectId}/recalculate`)
      await fetchRecommendations()
    } catch (err) {
      setError(err instanceof Error ? err.message : '재계산에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleContact = (freelancerId: number) => {
    // TODO: Implement contact/message functionality
    console.log('Contact freelancer:', freelancerId)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">추천 프리랜서를 찾고 있습니다...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <div>
              <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchRecommendations}>다시 시도</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.recommendations.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <div>
              <h2 className="text-xl font-semibold mb-2">추천할 프리랜서가 없습니다</h2>
              <p className="text-muted-foreground mb-4">
                프로젝트 요구 기술을 확인하고 다시 시도해주세요.
              </p>
              <Button onClick={handleRecalculate}>다시 계산하기</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{data.projectTitle}</h1>
            <p className="text-muted-foreground">
              총 {data.recommendations.length}명의 프리랜서를 추천합니다
            </p>
          </div>
          <Button onClick={handleRecalculate} variant="outline">
            재계산하기
          </Button>
        </div>

        {/* Info Card */}
        <div className="bg-muted/50 rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">📊 매칭 점수 산정 기준</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-primary">스킬 매칭 (50점)</span>
              <p className="text-muted-foreground">
                요구 기술 보유 여부 및 숙련도
              </p>
            </div>
            <div>
              <span className="font-medium text-primary">경력 (30점)</span>
              <p className="text-muted-foreground">
                총 경력 연수, 완료 프로젝트 수, 평균 평점
              </p>
            </div>
            <div>
              <span className="font-medium text-primary">단가 (20점)</span>
              <p className="text-muted-foreground">
                프로젝트 예산과 희망 단가 일치도
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Freelancer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.recommendations.map((freelancer) => (
          <FreelancerCard
            key={freelancer.freelancerId}
            freelancer={freelancer}
            onContact={() => handleContact(freelancer.freelancerId)}
          />
        ))}
      </div>
    </div>
  )
}
