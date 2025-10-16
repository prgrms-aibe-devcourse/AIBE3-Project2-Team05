import { useEffect } from 'react'
import type { FreelancerRecommendationDto } from '@/lib/backend/apiV1/types'

interface FreelancerProfileModalProps {
  freelancer: FreelancerRecommendationDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PROFICIENCY_CONFIG = {
  EXPERT: {
    label: '특급',
    background: '#d1fae5',
    color: '#065f46'
  },
  ADVANCED: {
    label: '고급',
    background: '#dbeafe',
    color: '#1e40af'
  },
  INTERMEDIATE: {
    label: '중급',
    background: '#fef3c7',
    color: '#92400e'
  },
  BEGINNER: {
    label: '초급',
    background: '#f3f4f6',
    color: '#374151'
  }
} as const

export function FreelancerProfileModal({
  freelancer,
  open,
  onOpenChange
}: FreelancerProfileModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onOpenChange])

  if (!freelancer || !open) return null

  const getProficiencyInfo = (proficiency: string) => {
    return PROFICIENCY_CONFIG[proficiency as keyof typeof PROFICIENCY_CONFIG] || {
      label: proficiency,
      background: '#f3f4f6',
      color: '#374151'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '20px'
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            padding: '4px',
            zIndex: 10
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>

        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#111',
            margin: 0
          }}>
            {freelancer.freelancerName}
          </h2>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* 기본 정보 */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '12px',
              color: '#222'
            }}>
              기본 정보
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              fontSize: '14px'
            }}>
              <div>
                <span style={{ color: '#666' }}>경력:</span>
                <span style={{
                  marginLeft: '8px',
                  fontWeight: 600,
                  color: '#222'
                }}>
                  {freelancer.totalExperience > 0
                    ? `${freelancer.totalExperience}년`
                    : '신입'}
                </span>
              </div>
              <div>
                <span style={{ color: '#666' }}>완료 프로젝트:</span>
                <span style={{
                  marginLeft: '8px',
                  fontWeight: 600,
                  color: '#222'
                }}>
                  {freelancer.completedProjects}개
                </span>
              </div>
              {freelancer.averageRating > 0 && (
                <div>
                  <span style={{ color: '#666' }}>평점:</span>
                  <span style={{
                    marginLeft: '8px',
                    fontWeight: 600,
                    color: '#222'
                  }}>
                    ⭐ {freelancer.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
              <div>
                <span style={{ color: '#666' }}>매칭 점수:</span>
                <span style={{
                  marginLeft: '8px',
                  fontWeight: 600,
                  color: '#16a34a'
                }}>
                  {freelancer.matchingScore.toFixed(1)}점 (#{freelancer.rank}위)
                </span>
              </div>
            </div>
          </div>

          {/* 보유 기술 */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '12px',
              color: '#222'
            }}>
              보유 기술
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {freelancer.skills.map((skill, index) => {
                const info = getProficiencyInfo(skill.proficiency)
                return (
                  <span
                    key={index}
                    style={{
                      background: info.background,
                      color: info.color,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {skill.techName} ({info.label})
                  </span>
                )
              })}
            </div>
          </div>

          {/* 점수 상세 */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '12px',
              color: '#222'
            }}>
              점수 상세
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Skill Score */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>스킬 매칭</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 2
                }}>
                  <div style={{
                    flex: 1,
                    background: '#f3f4f6',
                    borderRadius: '9999px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        background: '#16a34a',
                        height: '8px',
                        borderRadius: '9999px',
                        width: `${(freelancer.skillScore / 50) * 100}%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    minWidth: '80px',
                    textAlign: 'right',
                    color: '#222'
                  }}>
                    {freelancer.skillScore.toFixed(1)} / 50
                  </span>
                </div>
              </div>

              {/* Experience Score */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>경력</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 2
                }}>
                  <div style={{
                    flex: 1,
                    background: '#f3f4f6',
                    borderRadius: '9999px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        background: '#16a34a',
                        height: '8px',
                        borderRadius: '9999px',
                        width: `${(freelancer.experienceScore / 30) * 100}%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    minWidth: '80px',
                    textAlign: 'right',
                    color: '#222'
                  }}>
                    {freelancer.experienceScore.toFixed(1)} / 30
                  </span>
                </div>
              </div>

              {/* Budget Score */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>단가</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 2
                }}>
                  <div style={{
                    flex: 1,
                    background: '#f3f4f6',
                    borderRadius: '9999px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        background: '#16a34a',
                        height: '8px',
                        borderRadius: '9999px',
                        width: `${(freelancer.budgetScore / 20) * 100}%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    minWidth: '80px',
                    textAlign: 'right',
                    color: '#222'
                  }}>
                    {freelancer.budgetScore.toFixed(1)} / 20
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 희망 단가 */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '12px',
              color: '#222'
            }}>
              희망 단가
            </h3>
            <div style={{ fontSize: '14px' }}>
              <span style={{
                fontWeight: 600,
                fontSize: '18px',
                color: '#222'
              }}>
                {freelancer.minRate.toLocaleString()} ~ {freelancer.maxRate.toLocaleString()}
              </span>
              <span style={{
                marginLeft: '8px',
                color: '#666'
              }}>
                원/시간
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
