'use client'

import { Card } from '@/ui/card'
import { Badge } from '@/ui/badge'
import type { Conversation } from '@/hooks/useConversations'

interface ConversationCardProps {
  conversation: Conversation
  currentUserRole: 'PM' | 'FREELANCER'
  onClick: () => void
}

export function ConversationCard({
  conversation,
  currentUserRole,
  onClick
}: ConversationCardProps) {
  // 상대방 이름 (PM은 프리랜서를, 프리랜서는 PM을 봄)
  const otherPartyName = currentUserRole === 'PM'
    ? conversation.freelancerName
    : conversation.pmName

  // 마지막 메시지 내용 (30자 제한)
  const lastMessagePreview = conversation.lastMessage.length > 30
    ? conversation.lastMessage.substring(0, 30) + '...'
    : conversation.lastMessage

  // 상대 시간 계산
  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const messageDate = new Date(dateString)
    const diffMs = now.getTime() - messageDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`

    // 1주일 이상은 날짜 표시
    return messageDate.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* 프로필 이미지 (원형) */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {otherPartyName.charAt(0)}
            </span>
          </div>
        </div>

        {/* 중간: 이름, 프로젝트명, 마지막 메시지 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{otherPartyName}</h3>
          </div>
          <p className="text-sm text-muted-foreground truncate mb-1">
            {conversation.projectTitle}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {lastMessagePreview}
          </p>
        </div>

        {/* 오른쪽: 시간, 읽지 않은 뱃지 */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {getRelativeTime(conversation.lastMessageAt)}
          </span>
          {conversation.unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
