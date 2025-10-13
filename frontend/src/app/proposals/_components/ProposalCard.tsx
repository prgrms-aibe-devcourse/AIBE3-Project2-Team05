import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'

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
}

export function ProposalCard({ proposal, isPm, onAccept, onReject, onCancel }: ProposalCardProps) {
  const isPending = proposal.status === 'PENDING'

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
        {isPending && (
          <div className="flex gap-2 pt-2">
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
