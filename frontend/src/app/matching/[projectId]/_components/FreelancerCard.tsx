import type { FreelancerRecommendationDto } from '@/lib/backend/apiV1/types'

interface FreelancerCardProps {
  freelancer: FreelancerRecommendationDto
  onPropose?: () => void
  onViewProfile?: () => void
  isPm?: boolean
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

const MAX_VISIBLE_SKILLS = 6

export function FreelancerCard({ freelancer, onPropose, onViewProfile, isPm = false }: FreelancerCardProps) {
  const getProficiencyInfo = (proficiency: string) => {
    return PROFICIENCY_CONFIG[proficiency as keyof typeof PROFICIENCY_CONFIG] || {
      label: proficiency,
      background: '#f3f4f6',
      color: '#374151'
    }
  }

  const visibleSkills = freelancer.skills.slice(0, MAX_VISIBLE_SKILLS)
  const remainingCount = freelancer.skills.length - MAX_VISIBLE_SKILLS

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#fff',
      borderRadius: '13px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s',
      overflow: 'hidden'
    }}
    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
    onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'}
    >
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'start',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#222',
              marginBottom: '8px'
            }}>
              {freelancer.freelancerName}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#666',
              flexWrap: 'wrap'
            }}>
              <span>
                {freelancer.totalExperience > 0
                  ? `${freelancer.totalExperience}년 경력`
                  : '신입'}
              </span>
              <span>•</span>
              <span>완료 프로젝트: {freelancer.completedProjects}개</span>
              {freelancer.averageRating > 0 && (
                <>
                  <span>•</span>
                  <span>⭐ {freelancer.averageRating.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#16a34a'
            }}>
              {freelancer.matchingScore.toFixed(1)}점
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999'
            }}>
              #{freelancer.rank}위
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Skill Tags */}
        <div style={{
          minHeight: '104px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '10px'
          }}>
            보유 기술
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {visibleSkills.map((skill, index) => {
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
            {remainingCount > 0 && (
              <span
                style={{
                  background: '#f3f4f6',
                  color: '#6b7280',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                + 외 {remainingCount}개
              </span>
            )}
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '10px'
          }}>
            점수 상세
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '14px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#666' }}>스킬 매칭</span>
              <span style={{ fontWeight: 600, color: '#222' }}>
                {freelancer.skillScore.toFixed(1)} / 50
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#666' }}>경력</span>
              <span style={{ fontWeight: 600, color: '#222' }}>
                {freelancer.experienceScore.toFixed(1)} / 30
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#666' }}>단가</span>
              <span style={{ fontWeight: 600, color: '#222' }}>
                {freelancer.budgetScore.toFixed(1)} / 20
              </span>
            </div>
          </div>
        </div>

        {/* Rate Range */}
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '10px'
          }}>
            희망 단가
          </h4>
          <div style={{ fontSize: '14px' }}>
            <span style={{ fontWeight: 600, color: '#222' }}>
              {freelancer.minRate.toLocaleString()} ~ {freelancer.maxRate.toLocaleString()}
            </span>
            <span style={{ color: '#666' }}> 원/시간</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '10px',
          paddingTop: '8px'
        }}>
          {isPm && (
            <button
              onClick={onPropose}
              disabled={freelancer.alreadyProposed}
              style={{
                flex: 1,
                background: freelancer.alreadyProposed ? '#9ca3af' : '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: freelancer.alreadyProposed ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: freelancer.alreadyProposed ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!freelancer.alreadyProposed) {
                  e.currentTarget.style.background = '#15803d'
                }
              }}
              onMouseOut={(e) => {
                if (!freelancer.alreadyProposed) {
                  e.currentTarget.style.background = '#16a34a'
                }
              }}
            >
              {freelancer.alreadyProposed ? '제안 완료' : '제안하기'}
            </button>
          )}
          <button
            onClick={onViewProfile}
            style={{
              flex: 1,
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px 20px',
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
            프로필 보기
          </button>
        </div>
      </div>
    </div>
  )
}
