import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/backend/client'

export interface ChatMessage {
  id: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
  isRead: boolean
}

interface UseChatMessagesProps {
  projectId: number
  freelancerId: number
  receiverId: number  // 실제 수신자 회원 ID
  currentUserId: number
  isOpen: boolean
}

export function useChatMessages({
  projectId,
  freelancerId,
  receiverId,
  currentUserId,
  isOpen
}: UseChatMessagesProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch conversation history
  const fetchMessages = useCallback(async () => {
    if (!isOpen || !projectId || !freelancerId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<ChatMessage[]>(
        `/api/v1/messages/conversation/${projectId}/${freelancerId}`
      )

      // apiClient.get은 RsData를 자동으로 unwrap하므로 response.data가 곧 ChatMessage[]
      setMessages(response.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '메시지를 불러오는데 실패했습니다.')
      console.error('Failed to fetch messages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, freelancerId, isOpen])

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    try {
      // Optimistic update
      const tempMessage: ChatMessage = {
        id: Date.now(), // temporary ID
        senderId: currentUserId,
        senderName: '나',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        isRead: false
      }

      setMessages(prev => [...prev, tempMessage])

      // Send to server - receiverId는 실제 수신자의 회원 ID
      const response = await apiClient.post<ChatMessage>('/api/v1/messages', {
        receiverId: receiverId,  // 수정: freelancerId → receiverId
        relatedType: 'PROJECT',
        relatedId: projectId,
        content: content.trim()
      })

      // Replace temp message with server response
      if (response.data) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id ? response.data : msg  // 수정: response.data.data → response.data
          )
        )
      }
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()))
      throw err
    }
  }, [projectId, receiverId, currentUserId])

  // Fetch messages when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen, fetchMessages])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refetch: fetchMessages
  }
}
