'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/app/context/UserContext'
import { useConversations } from '@/hooks/useConversations'
import '@/styles/applications-messages.css'
import { ConversationCard } from './_components/ConversationCard'
import { ChatModal } from '@/components/ChatModal'
import { Card } from '@/ui/card'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useUser()
  const { conversations, isLoading, error, refetch } = useConversations()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<{
    projectId: number
    freelancerId: number
    receiverId: number
    receiverName: string
    projectTitle: string
  } | null>(null)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)

  // PM 여부 확인
  useEffect(() => {
    const checkRole = async () => {
      if (!user || authLoading) return

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/freelancers/me`,
          { credentials: 'include' }
        )

        if (res.ok) {
          const data = await res.json()
          setIsFreelancer(data.resultCode?.startsWith('200'))
        } else {
          setIsFreelancer(false)
        }
      } catch {
        setIsFreelancer(false)
      }
    }

    checkRole()
  }, [user, authLoading])

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
    setSelectedConversation({
      projectId: conversation.projectId,
      freelancerId: conversation.freelancerId,
      receiverId: isFreelancer ? conversation.pmId : conversation.freelancerId,
      receiverName: isFreelancer ? conversation.pmName : conversation.freelancerName,
      projectTitle: conversation.projectTitle
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

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-page">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-page">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refetch}>다시 시도</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-page">
      <h1 className="text-3xl font-bold mb-6">메시지</h1>

      {/* 검색 및 필터 */}
      {conversations.length > 0 && (
        <div className="mb-6 space-y-4">
          <Input
            placeholder="프로젝트명, 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <div className="flex gap-2">
            <Button
              variant={showUnreadOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              읽지 않음만 보기
              {showUnreadOnly && ` (${conversations.filter(c => c.unreadCount > 0).length})`}
            </Button>
          </div>
        </div>
      )}

      {/* 대화방 목록 */}
      {filteredConversations.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          {conversations.length === 0 ? (
            <>
              <div className="text-4xl mb-4">💬</div>
              <p className="mb-2">메시지가 없습니다</p>
              <p className="text-sm">제안을 주고받으면 여기에 대화가 표시됩니다.</p>
            </>
          ) : (
            <>
              <p className="mb-2">검색 결과가 없습니다</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setShowUnreadOnly(false)
              }}>
                필터 초기화
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-2">
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
        />
      )}
    </div>
  )
}
