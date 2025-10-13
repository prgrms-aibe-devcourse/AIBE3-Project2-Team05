import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { apiClient } from '@/global/backend/client'

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">
              {proposal.projectTitle}
            </CardTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {isPm
                  ? `프리랜서: ${proposal.freelancerName}`
                  : `PM: ${proposal.pmName}`
                }
              </p>
              <p>제안일: {new Date(proposal.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
          <StatusBadge status={proposal.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 프로젝트 상세 정보 (수락된 경우) */}
        {isAccepted && project && (
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">프로젝트 상세 정보</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectDetails(!showProjectDetails)}
                className="text-xs"
              >
                {showProjectDetails ? '접기 ▲' : '펼치기 ▼'}
              </Button>
            </div>
            {showProjectDetails && (
              <div className="space-y-2 text-sm mt-3">
                <div>
                  <span className="text-muted-foreground">설명:</span>
                  <p className="mt-1">{project.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">예산:</span>
                    <p className="font-semibold">{project.budget?.toLocaleString()}만원</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">기간:</span>
                    <p>{project.startDate} ~ {project.endDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* 제안 메시지 */}
        <div>
          <h4 className="text-sm font-semibold mb-2">제안 내용</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {proposal.message}
          </p>
        </div>

        {/* 응답 메시지 (있을 경우) */}
        {proposal.responseMessage && (
          <div>
            <h4 className="text-sm font-semibold mb-2">응답</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.responseMessage}
            </p>
            {proposal.rejectionReason && (
              <p className="text-sm text-red-600 mt-2">
                거절 사유: {proposal.rejectionReason}
              </p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-2">
          {isPending && (
            <>
              {isPm ? (
                <Button
                  onClick={() => onCancel?.(proposal.id)}
                  variant="outline"
                  className="flex-1"
                >
                  제안 취소
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => onAccept?.(proposal.id)}
                    className="flex-1"
                  >
                    수락
                  </Button>
                  <Button
                    onClick={() => onReject?.(proposal.id)}
                    variant="outline"
                    className="flex-1"
                  >
                    거절
                  </Button>
                </>
              )}
            </>
          )}

          {/* 수락된 제안: 메시지 보내기 버튼 */}
          {isAccepted && (
            <Button
              onClick={onSendMessage}
              className="flex-1"
            >
              💬 메시지 보내기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
