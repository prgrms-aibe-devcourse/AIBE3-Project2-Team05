'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/app/context/UserContext'
import { useConversations } from '@/hooks/useConversations'
import '@/styles/applications-messages.css'
import { ConversationCard } from './_components/ConversationCard'
import { ChatModal } from '@/components/ChatModal'
import { RoleSelectionModal } from '@/components/RoleSelectionModal'

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

export default function MessagesPage() {
  const { user, selectedRole, roles, setSelectedRole, isLoading: authLoading } = useUser()
  const { conversations, isLoading, error, refetch } = useConversations()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<{
    projectId: number
    freelancerId: number
    receiverId: number
    receiverName: string
    projectTitle: string
    relatedType?: string
    relatedId?: number
  } | null>(null)

  const isFreelancer = selectedRole === 'FREELANCER'

  // 역할 선택 모달 표시 체크
  useEffect(() => {
    console.log('[Messages Debug] Role check:', {
      authLoading,
      user: !!user,
      selectedRole,
      roles,
      hasBothRoles: roles.includes('PM') && roles.includes('FREELANCER')
    })

    if (!authLoading && user && !selectedRole && roles.includes('PM') && roles.includes('FREELANCER')) {
      console.log('[Messages Debug] Showing role modal')
      setShowRoleModal(true)
    } else {
      setShowRoleModal(false)
    }
  }, [authLoading, user, selectedRole, roles])

  // 검색 필터링
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.freelancerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.pmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesUnread = !showUnreadOnly || conv.unreadCount > 0

    return matchesSearch && matchesUnread
  })

  const handleConversationClick = useCallback((conversation: typeof conversations[0]) => {
    // receiverId: 회원 ID를 사용 (freelancerMemberId가 없으면 fallback으로 freelancerId)
    const receiverId = isFreelancer
      ? conversation.pmId
      : (conversation.freelancerMemberId ?? conversation.freelancerId)

    console.log('[Messages Debug] Opening chat:', {
      isFreelancer,
      pmId: conversation.pmId,
      freelancerId: conversation.freelancerId,
      freelancerMemberId: conversation.freelancerMemberId,
      receiverId,
      relatedType: conversation.relatedType,
      relatedId: conversation.relatedId
    })

    setSelectedConversation({
      projectId: conversation.projectId,
      freelancerId: conversation.freelancerId,
      receiverId: receiverId,
      receiverName: isFreelancer ? conversation.pmName : conversation.freelancerName,
      projectTitle: conversation.projectTitle,
      relatedType: conversation.relatedType,
      relatedId: conversation.relatedId
    })
    setChatModalOpen(true)
  }, [isFreelancer])

  const handleCloseChat = useCallback(() => {
    setChatModalOpen(false)
    // 모달 닫을 때 대화방 목록 새로고침 (읽음 처리 반영)
    setTimeout(() => {
      refetch()
    }, 500)
  }, [refetch])

  if (authLoading || isLoading || !selectedRole) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '64px 16px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <InlineLoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '64px 16px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
        }}>
          <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={refetch}
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
    )
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 16px',
      minHeight: 'calc(100vh - 200px)'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 800,
        marginBottom: '24px',
        color: '#333'
      }}>
        메시지
      </h1>

      {/* 검색 및 필터 */}
      {conversations.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="프로젝트명, 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '448px',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none',
              marginBottom: '12px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#16a34a'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              style={{
                background: showUnreadOnly ? '#16a34a' : '#fff',
                color: showUnreadOnly ? '#fff' : '#374151',
                border: showUnreadOnly ? 'none' : '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!showUnreadOnly) {
                  e.currentTarget.style.background = '#f9fafb'
                }
              }}
              onMouseOut={(e) => {
                if (!showUnreadOnly) {
                  e.currentTarget.style.background = '#fff'
                }
              }}
            >
              읽지 않음만 보기
              {showUnreadOnly && ` (${conversations.filter(c => c.unreadCount > 0).length})`}
            </button>
          </div>
        </div>
      )}

      {/* 대화방 목록 */}
      {filteredConversations.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          color: '#666',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
        }}>
          {conversations.length === 0 ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>메시지가 없습니다</p>
              <p style={{ fontSize: '14px' }}>제안을 주고받으면 여기에 대화가 표시됩니다.</p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '16px', fontSize: '16px' }}>검색 결과가 없습니다</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setShowUnreadOnly(false)
                }}
                style={{
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
              >
                필터 초기화
              </button>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredConversations.map((conversation) => (
            <ConversationCard
              key={`${conversation.projectId}-${conversation.freelancerId}`}
              conversation={conversation}
              currentUserRole={user?.role === 'FREELANCER' ? 'FREELANCER' : 'PM'}
              onClick={() => handleConversationClick(conversation)}
            />
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {selectedConversation && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={handleCloseChat}
          projectId={selectedConversation.projectId}
          freelancerId={selectedConversation.freelancerId}
          receiverId={selectedConversation.receiverId}
          receiverName={selectedConversation.receiverName}
          projectTitle={selectedConversation.projectTitle}
          relatedType={selectedConversation.relatedType}
          relatedId={selectedConversation.relatedId}
        />
      )}

      {/* Role Selection Modal */}
      <RoleSelectionModal
        open={showRoleModal}
        onSelect={(role) => {
          console.log('[Messages Debug] Role selected:', role)
          setSelectedRole(role)
          setShowRoleModal(false)
        }}
      />
    </div>
  )
}
