import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/backend/client'

export interface ChatMessage {
  id: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
  isRead: boolean
  relatedType?: string  // 백엔드에서 제공 시 사용
  relatedId?: number    // 백엔드에서 제공 시 사용
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
  const [savedRelatedInfo, setSavedRelatedInfo] = useState<{
    relatedType: string
    relatedId: number
  } | null>(null)

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
      const fetchedMessages = response.data ?? []
      setMessages(fetchedMessages)

      // 첫 메시지에서 relatedType/Id 저장 (백엔드가 제공하는 경우)
      if (fetchedMessages.length > 0 && !savedRelatedInfo) {
        const firstMsg = fetchedMessages[0]
        if (firstMsg.relatedType && firstMsg.relatedId) {
          console.log('[ChatDebug] Saving relatedInfo from first message:', {
            relatedType: firstMsg.relatedType,
            relatedId: firstMsg.relatedId
          })
          setSavedRelatedInfo({
            relatedType: firstMsg.relatedType,
            relatedId: firstMsg.relatedId
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '메시지를 불러오는데 실패했습니다.')
      console.error('Failed to fetch messages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, freelancerId, isOpen, savedRelatedInfo])

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // relatedType/Id 결정: 저장된 값 우선, 없으면 PROJECT/projectId 사용
    const relatedType = savedRelatedInfo?.relatedType || 'PROJECT'
    const relatedId = savedRelatedInfo?.relatedId || projectId

    console.log('[ChatDebug] Sending message:', {
      receiverId,
      relatedType,
      relatedId,
      projectId,
      freelancerId,
      contentLength: content.trim().length
    })

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
        receiverId: receiverId,
        relatedType: relatedType,
        relatedId: relatedId,
        content: content.trim()
      })

      console.log('[ChatDebug] Message sent successfully:', response)

      // Replace temp message with server response
      if (response.data) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id ? response.data : msg
          )
        )
      }
    } catch (err) {
      console.error('[ChatDebug] Message send failed:', err)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()))
      throw err
    }
  }, [projectId, freelancerId, receiverId, currentUserId, savedRelatedInfo])

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
