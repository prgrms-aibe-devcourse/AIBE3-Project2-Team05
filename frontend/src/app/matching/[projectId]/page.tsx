'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FreelancerCard } from './_components/FreelancerCard'
import { FreelancerProfileModal } from './_components/FreelancerProfileModal'
import { ProposalMessageModal } from './_components/ProposalMessageModal'
import { apiClient } from '@/lib/backend/client'
import { useUser } from '@/app/context/UserContext'
import type { RecommendationResponseDto, FreelancerRecommendationDto } from '@/lib/backend/apiV1/types'

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

export default function MatchingPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, roles, isLoading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RecommendationResponseDto | null>(null)
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerRecommendationDto | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [proposalTargetFreelancer, setProposalTargetFreelancer] = useState<{ id: number; name: string } | null>(null)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)

  const isPm = isFreelancer === false

  // 역할 확인 (roles 기반)
  useEffect(() => {
    if (authLoading || !user) return

    const hasFreelancerRole = roles.includes('FREELANCER')
    setIsFreelancer(hasFreelancerRole)
    console.log('[MatchingDetail] Freelancer role check:', { roles, hasFreelancerRole })
  }, [user, authLoading, roles])

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요한 서비스입니다.')
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user && isFreelancer !== null) {
      fetchRecommendations(isPm)
    }
  }, [projectId, user, isFreelancer])

  const fetchRecommendations = async (autoRecalculate = false) => {
    try {
      setLoading(true)
      setError(null)

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

      // 제안 후 목록 새로고침하여 alreadyProposed 상태 업데이트
      await fetchRecommendations()
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
          <InlineLoadingSpinner />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#222',
                marginBottom: '8px'
              }}>
                오류가 발생했습니다
              </h2>
              <p style={{
                color: '#666',
                marginBottom: '16px',
                fontSize: '15px'
              }}>
                {error}
              </p>
              <button
                onClick={() => fetchRecommendations()}
                style={{
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#222',
                marginBottom: '8px'
              }}>
                추천할 프리랜서가 없습니다
              </h2>
              <p style={{
                color: '#666',
                marginBottom: '16px',
                fontSize: '15px'
              }}>
                프로젝트 요구 기술을 확인하고 다시 시도해주세요.
              </p>
              <button
                onClick={handleRecalculate}
                style={{
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
                다시 계산하기
              </button>
            </div>
          </div>
        </div>
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
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#333',
                letterSpacing: '-1px',
                marginBottom: '8px'
              }}>
                {data.projectTitle}
              </h1>
              <p style={{ color: '#666', fontSize: '15px' }}>
                {isFreelancer
                  ? '이 프로젝트와의 매칭 점수입니다'
                  : `총 ${data.recommendations.length}명의 프리랜서를 추천합니다 (TOP 10)`}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {isPm && (
                <button
                  onClick={handleViewAllFreelancers}
                  style={{
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#16a34a'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  전체 프리랜서 목록
                </button>
              )}
              <button
                onClick={handleRecalculate}
                style={{
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f9fafb'
                  e.currentTarget.style.borderColor = '#16a34a'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
              >
                {isFreelancer ? '내 점수 업데이트' : '전체 재계산'}
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div style={{
            background: '#fff',
            borderRadius: '13px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            padding: '20px 24px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontWeight: 600,
              marginBottom: '16px',
              color: '#222',
              fontSize: '16px'
            }}>
              📊 매칭 점수 산정 기준
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              fontSize: '14px'
            }}>
              <div>
                <span style={{
                  fontWeight: 600,
                  color: '#16a34a',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  스킬 매칭 (50점)
                </span>
                <p style={{
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  요구 기술 보유 여부 및 숙련도
                </p>
              </div>
              <div>
                <span style={{
                  fontWeight: 600,
                  color: '#16a34a',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  경력 (30점)
                </span>
                <p style={{
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  총 경력 연수, 완료 프로젝트 수, 평균 평점
                </p>
              </div>
              <div>
                <span style={{
                  fontWeight: 600,
                  color: '#16a34a',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  단가 (20점)
                </span>
                <p style={{
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  프로젝트 예산과 희망 단가 일치도
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Freelancer Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: '24px'
        }}>
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
    </div>
  )
}
