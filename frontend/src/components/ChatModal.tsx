'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { useChatMessages } from '@/hooks/useChatMessages'
import { useUser } from '@/app/context/UserContext'
import { apiClient } from '@/lib/backend/client'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  freelancerId: number
  receiverId: number  // 실제 수신자 회원 ID
  receiverName: string
  projectTitle: string
}

export function ChatModal({
  isOpen,
  onClose,
  projectId,
  freelancerId,
  receiverId,
  receiverName,
  projectTitle
}: ChatModalProps) {
  const { user } = useUser()
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, error, sendMessage, refetch } = useChatMessages({
    projectId,
    freelancerId,
    receiverId,  // receiverId 추가
    currentUserId: user?.id || 0,
    isOpen
  })

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 대화방 열 때 자동 읽음 처리
  useEffect(() => {
    if (isOpen && projectId && freelancerId) {
      const markAsRead = async () => {
        try {
          await apiClient.put(
            `/api/v1/messages/conversation/${projectId}/${freelancerId}/read`,
            {}
          )
        } catch (err) {
          console.error('Failed to mark messages as read:', err)
        }
      }
      markAsRead()
    }
  }, [isOpen, projectId, freelancerId])

  // 폴링 방식 실시간 업데이트 (5초마다)
  useEffect(() => {
    if (!isOpen) return

    const pollingInterval = setInterval(() => {
      refetch()
    }, 5000) // 5초마다 새 메시지 확인

    return () => clearInterval(pollingInterval)
  }, [isOpen, refetch])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim() || inputMessage.trim().length < 5) {
      alert('메시지는 최소 5자 이상 입력해주세요.')
      return
    }

    setIsSending(true)
    try {
      await sendMessage(inputMessage)
      setInputMessage('')
    } catch (err) {
      alert(err instanceof Error ? err.message : '메시지 전송에 실패했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? '오후' : '오전'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes

    return `${ampm} ${displayHours}:${displayMinutes}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] h-[600px] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {receiverName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{projectTitle}</p>
        </DialogHeader>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-background"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
          }}
        >
          {isLoading && (
            <div className="text-center text-muted-foreground py-8">
              메시지를 불러오는 중...
            </div>
          )}

          {error && (
            <div className="text-center text-destructive py-8">{error}</div>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              첫 메시지를 보내보세요!
            </div>
          )}

          {!isLoading &&
            !error &&
            messages.map((message) => {
              const isMine = message.senderId === user?.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}
                  >
                    {!isMine && (
                      <span className="text-xs text-muted-foreground mb-1">
                        {message.senderName}
                      </span>
                    )}
                    <div className="flex items-end gap-2">
                      {isMine && (
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.createdAt)}
                        </span>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isMine
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      {!isMine && (
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="px-6 py-4 border-t bg-background sticky bottom-0"
        >
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1"
              disabled={isSending}
              minLength={5}
            />
            <Button type="submit" disabled={isSending || !inputMessage.trim()}>
              {isSending ? '전송 중...' : '전송'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            최소 5자 이상 입력해주세요
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
