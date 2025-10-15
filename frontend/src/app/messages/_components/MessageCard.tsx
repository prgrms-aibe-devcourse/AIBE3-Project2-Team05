import { Card, CardContent } from '@/ui/card'
import { Badge } from '@/ui/badge'

interface Message {
  id: number
  projectId: number
  projectTitle: string
  pmId: number
  pmName: string
  freelancerId: number
  freelancerName: string
  senderId: number
  senderName: string
  relatedType: string
  relatedId: number
  content: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

interface MessageCardProps {
  message: Message
  currentUserId?: number
  onMarkAsRead?: (id: number) => void
}

export function MessageCard({ message, currentUserId, onMarkAsRead }: MessageCardProps) {
  const isSender = message.senderId === currentUserId
  const isUnread = !message.isRead && !isSender

  return (
    <Card className={isUnread ? 'border-primary' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {message.senderName}
              </span>
              {isSender && (
                <Badge variant="secondary" className="text-xs">내가 보냄</Badge>
              )}
              {isUnread && (
                <Badge className="text-xs bg-primary">읽지 않음</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              프로젝트: {message.projectTitle}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {isUnread && onMarkAsRead && (
          <button
            onClick={() => onMarkAsRead(message.id)}
            className="text-xs text-primary hover:underline mt-2"
          >
            읽음 표시
          </button>
        )}
      </CardContent>
    </Card>
  )
}
