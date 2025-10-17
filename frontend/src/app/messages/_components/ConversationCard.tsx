'use client'

import { memo, useState } from 'react'
import type { Conversation } from '@/hooks/useConversations'

interface ConversationCardProps {
  conversation: Conversation
  currentUserRole: 'PM' | 'FREELANCER'
  onClick: () => void
}

export const ConversationCard = memo(function ConversationCard({
  conversation,
  currentUserRole,
  onClick
}: ConversationCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? '#f9fafb' : '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background 0.2s, box-shadow 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* 프로필 이미지 (원형) */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(22, 163, 74, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#16a34a'
            }}>
              {otherPartyName.charAt(0)}
            </span>
          </div>
        </div>

        {/* 중간: 이름, 프로젝트명, 마지막 메시지 */}
        <div style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <h3 style={{
              fontWeight: 600,
              fontSize: '16px',
              color: '#111',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {otherPartyName}
            </h3>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 4px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {conversation.projectTitle}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {lastMessagePreview}
          </p>
        </div>

        {/* 오른쪽: 시간, 읽지 않은 뱃지 */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#666',
            whiteSpace: 'nowrap'
          }}>
            {getRelativeTime(conversation.lastMessageAt)}
          </span>
          {conversation.unreadCount > 0 && (
            <div style={{
              background: '#dc2626',
              color: '#fff',
              borderRadius: '50%',
              minWidth: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 6px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {conversation.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
