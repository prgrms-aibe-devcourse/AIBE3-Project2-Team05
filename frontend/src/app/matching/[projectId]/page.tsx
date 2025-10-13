'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/ui/button'
import { FreelancerCard } from './_components/FreelancerCard'
import { FreelancerProfileModal } from './_components/FreelancerProfileModal'
import { ProposalMessageModal } from './_components/ProposalMessageModal'
import { apiClient } from '@/global/backend/client'
import { useAuth } from '@/global/auth/hooks/useAuth'
import type { RecommendationResponseDto, FreelancerRecommendationDto } from '@/global/backend/apiV1/types'

export default function MatchingPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RecommendationResponseDto | null>(null)
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerRecommendationDto | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [proposalTargetFreelancer, setProposalTargetFreelancer] = useState<{ id: number; name: string } | null>(null)

  const isFreelancer = user?.role === 'FREELANCER'
  const isPm = user?.role !== 'FREELANCER' && user !== null // PM 또는 일반 사용자

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요한 서비스입니다.')
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      fetchRecommendations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user])

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
    // TODO: 프리랜서 담당 개발자가 /freelancers 페이지 구현 후 활성화
    alert('전체 프리랜서 목록 페이지는 추후 구현 예정입니다.')
    // window.location.href = '/freelancers'
  }

  const handleViewProfile = (freelancer: FreelancerRecommendationDto) => {
    setSelectedFreelancer(freelancer)
    setIsModalOpen(true)
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {authLoading ? '로그인 확인 중...' : '추천 프리랜서를 찾고 있습니다...'}
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
              {isFreelancer
                ? '이 프로젝트와의 매칭 점수입니다'
                : `총 ${data.recommendations.length}명의 프리랜서를 추천합니다 (TOP 10, 최소 60점 이상)`}
            </p>
          </div>
          <div className="flex gap-2">
            {isPm && (
              <Button onClick={handleViewAllFreelancers} variant="outline">
                전체 프리랜서 목록
              </Button>
            )}
            <Button onClick={handleRecalculate} variant="outline">
              {isFreelancer ? '내 점수 업데이트' : '전체 재계산'}
            </Button>
          </div>
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
