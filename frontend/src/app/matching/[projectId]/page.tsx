'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FreelancerCard } from './_components/FreelancerCard'
import { FreelancerProfileModal } from './_components/FreelancerProfileModal'
import { ProposalMessageModal } from './_components/ProposalMessageModal'
import { apiClient } from '@/lib/backend/client'
import { useUser } from '@/app/context/UserContext'
import type { RecommendationResponseDto, FreelancerRecommendationDto } from '@/lib/backend/apiV1/types'

export default function MatchingPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, isLoading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RecommendationResponseDto | null>(null)
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerRecommendationDto | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [proposalTargetFreelancer, setProposalTargetFreelancer] = useState<{ id: number; name: string } | null>(null)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)

  const isPm = isFreelancer === false

  // 역할 확인
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
          setIsFreelancer(data.resultCode?.startsWith('200'))
        } else {
          setIsFreelancer(false)
        }
      } catch {
        setIsFreelancer(false)
      }
    }

    checkRole()
  }, [user, authLoading])

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요한 서비스입니다.')
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    // isFreelancer가 결정된 후에만 실행
    if (user && isFreelancer !== null) {
      // PM일 때는 자동 재계산, 프리랜서일 때는 GET만 수행
      fetchRecommendations(isPm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user, isFreelancer])

  const fetchRecommendations = async (autoRecalculate = false) => {
    try {
      setLoading(true)
      setError(null)

      // PM이고 자동 재계산이 활성화된 경우 먼저 재계산 수행
      if (autoRecalculate) {
        await apiClient.post(`/api/v1/matching/recommend/${projectId}/recalculate`)
      }

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
      const response = await apiClient.post(`/api/v1/matching/recommend/${projectId}/recalculate`)
      await fetchRecommendations()

      // 성공 메시지 표시
      alert(response.msg || (isFreelancer ? '내 매칭 점수가 업데이트되었습니다!' : '매칭 점수가 재계산되었습니다.'))
    } catch (err) {
      setError(err instanceof Error ? err.message : '재계산에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePropose = (freelancerId: number, freelancerName: string) => {
    setProposalTargetFreelancer({ id: freelancerId, name: freelancerName })
    setIsProposalModalOpen(true)
  }

  const handleProposalSubmit = async (message: string) => {
    if (!proposalTargetFreelancer) return

    try {
      const response = await apiClient.post('/api/v1/proposals', {
        projectId: Number(projectId),
        freelancerId: proposalTargetFreelancer.id,
        message: message
      })

      alert(response.msg || '제안이 전송되었습니다.')
      setProposalTargetFreelancer(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '제안 전송에 실패했습니다.')
    }
  }

  const handleViewAllFreelancers = () => {
    router.push('/freelancers')
  }

  const handleViewProfile = (freelancer: FreelancerRecommendationDto) => {
    setSelectedFreelancer(freelancer)
    setIsModalOpen(true)
  }

  if (authLoading || loading || isFreelancer === null) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {authLoading ? '로그인 확인 중...' : isFreelancer === null ? '역할 확인 중...' : '추천 프리랜서를 찾고 있습니다...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우 (리디렉션 전 화면)
  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">오류가 발생했습니다</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={fetchRecommendations}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.recommendations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-5xl mb-4">🔍</div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">추천할 프리랜서가 없습니다</h2>
              <p className="text-muted-foreground mb-4">
                프로젝트 요구 기술을 확인하고 다시 시도해주세요.
              </p>
              <button
                onClick={handleRecalculate}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                다시 계산하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{data.projectTitle}</h1>
            <p className="text-muted-foreground">
              {isFreelancer
                ? '이 프로젝트와의 매칭 점수입니다'
                : `총 ${data.recommendations.length}명의 프리랜서를 추천합니다 (TOP 10)`}
            </p>
          </div>
          <div className="flex gap-2">
            {isPm && (
              <button
                onClick={handleViewAllFreelancers}
                className="px-4 py-2 bg-card text-card-foreground border border-border rounded-md text-sm font-medium hover:bg-accent hover:border-primary transition-colors"
              >
                전체 프리랜서 목록
              </button>
            )}
            <button
              onClick={handleRecalculate}
              className="px-4 py-2 bg-card text-card-foreground border border-border rounded-md text-sm font-medium hover:bg-accent hover:border-primary transition-colors"
            >
              {isFreelancer ? '내 점수 업데이트' : '전체 재계산'}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="font-semibold mb-2 text-foreground">📊 매칭 점수 산정 기준</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-primary">스킬 매칭 (50점)</span>
              <p className="text-muted-foreground mt-1">
                요구 기술 보유 여부 및 숙련도
              </p>
            </div>
            <div>
              <span className="font-medium text-primary">경력 (30점)</span>
              <p className="text-muted-foreground mt-1">
                총 경력 연수, 완료 프로젝트 수, 평균 평점
              </p>
            </div>
            <div>
              <span className="font-medium text-primary">단가 (20점)</span>
              <p className="text-muted-foreground mt-1">
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
            onPropose={() => handlePropose(freelancer.freelancerId, freelancer.freelancerName)}
            onViewProfile={() => handleViewProfile(freelancer)}
            isPm={isPm}
          />
        ))}
      </div>

      {/* Freelancer Profile Modal */}
      <FreelancerProfileModal
        freelancer={selectedFreelancer}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      {/* Proposal Message Modal */}
      {proposalTargetFreelancer && (
        <ProposalMessageModal
          freelancerName={proposalTargetFreelancer.name}
          open={isProposalModalOpen}
          onOpenChange={setIsProposalModalOpen}
          onSubmit={handleProposalSubmit}
        />
      )}
    </div>
  )
}
