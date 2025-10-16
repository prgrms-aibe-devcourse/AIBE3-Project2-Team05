import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/backend/client'

interface Project {
  id: number
  title: string
  description: string
  budget: number
  startDate: string
  endDate: string
}

interface Proposal {
  id: number
  projectId: number
  projectTitle: string
  pmId: number
  pmName: string
  freelancerId: number
  freelancerName: string
  message: string
  status: string
  responseMessage?: string
  rejectionReason?: string
  responseDate?: string
  createdAt: string
  updatedAt: string
}

interface ProposalCardProps {
  proposal: Proposal
  isPm: boolean
  onAccept?: (id: number) => void
  onReject?: (id: number) => void
  onCancel?: (id: number) => void
  onSendMessage?: () => void
}

// 상태별 배지 스타일
const getStatusStyle = (status: string) => {
  const styles = {
    PENDING: {
      background: '#fef3c7',
      color: '#92400e',
      label: '대기중'
    },
    ACCEPTED: {
      background: '#d1fae5',
      color: '#065f46',
      label: '수락됨'
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
  return styles[status as keyof typeof styles] || styles.PENDING
}

export function ProposalCard({ proposal, isPm, onAccept, onReject, onCancel, onSendMessage }: ProposalCardProps) {
  const isPending = proposal.status === 'PENDING'
  const isAccepted = proposal.status === 'ACCEPTED'
  const [project, setProject] = useState<Project | null>(null)
  const [showProjectDetails, setShowProjectDetails] = useState(false)

  useEffect(() => {
    if (isAccepted && !project) {
      loadProjectDetails()
    }
  }, [isAccepted])

  const loadProjectDetails = async () => {
    try {
      const response = await apiClient.get<Project[]>('/api/v1/projects')
      const found = response.data.find(p => p.id === proposal.projectId)
      if (found) {
        setProject(found)
      }
    } catch (error) {
      console.error('Failed to load project details:', error)
    }
  }

  const statusStyle = getStatusStyle(proposal.status)

  return (
    <div style={{
      background: '#fff',
      borderRadius: '13px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 28px',
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
              {proposal.projectTitle}
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#666',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <p>
                {isPm
                  ? `프리랜서: ${proposal.freelancerName}`
                  : `PM: ${proposal.pmName}`
                }
              </p>
              <p>제안일: {new Date(proposal.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
          {/* Status Badge */}
          <span style={{
            background: statusStyle.background,
            color: statusStyle.color,
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* 프로젝트 상세 정보 (수락된 경우) */}
        {isAccepted && project && (
          <div style={{
            background: '#f8faff',
            borderRadius: '10px',
            padding: '18px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>프로젝트 상세 정보</h4>
              <button
                onClick={() => setShowProjectDetails(!showProjectDetails)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {showProjectDetails ? '접기 ▲' : '펼치기 ▼'}
              </button>
            </div>
            {showProjectDetails && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '14px',
                marginTop: '12px'
              }}>
                <div>
                  <span style={{ color: '#6b7280' }}>설명:</span>
                  <p style={{ marginTop: '4px', color: '#374151' }}>{project.description}</p>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>예산:</span>
                    <p style={{ fontWeight: 600, color: '#222', marginTop: '4px' }}>
                      {project.budget?.toLocaleString()}만원
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>기간:</span>
                    <p style={{ color: '#374151', marginTop: '4px' }}>
                      {project.startDate} ~ {project.endDate}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 제안 메시지 */}
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>제안 내용</h4>
          <p style={{
            fontSize: '15px',
            color: '#555',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            background: '#f9fafb',
            padding: '12px 16px',
            borderRadius: '8px'
          }}>
            {proposal.message}
          </p>
        </div>

        {/* 응답 메시지 (있을 경우) */}
        {proposal.responseMessage && (
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>응답</h4>
            <p style={{
              fontSize: '15px',
              color: '#555',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              background: '#f9fafb',
              padding: '12px 16px',
              borderRadius: '8px'
            }}>
              {proposal.responseMessage}
            </p>
            {proposal.rejectionReason && (
              <p style={{
                fontSize: '14px',
                color: '#dc2626',
                marginTop: '8px',
                padding: '8px 12px',
                background: '#fef2f2',
                borderRadius: '6px'
              }}>
                거절 사유: {proposal.rejectionReason}
              </p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '8px'
        }}>
          {isPending && (
            <>
              {isPm ? (
                <button
                  onClick={() => onCancel?.(proposal.id)}
                  style={{
                    flex: 1,
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '10px 20px',
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
                  제안 취소
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onAccept?.(proposal.id)}
                    style={{
                      flex: 1,
                      background: '#16a34a',
                      border: 'none',
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#15803d'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#16a34a'}
                  >
                    수락
                  </button>
                  <button
                    onClick={() => onReject?.(proposal.id)}
                    style={{
                      flex: 1,
                      background: '#fff',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      padding: '10px 20px',
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
                    거절
                  </button>
                </>
              )}
            </>
          )}

          {/* 수락된 제안: 메시지 보내기 버튼 */}
          {isAccepted && (
            <button
              onClick={onSendMessage}
              style={{
                flex: 1,
                background: '#16a34a',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '15px',
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
    </div>
  )
}
