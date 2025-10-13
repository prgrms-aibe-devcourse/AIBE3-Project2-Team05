import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/global/backend/client'

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
  currentUserId: number
  isOpen: boolean
}

export function useChatMessages({
  projectId,
  freelancerId,
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
      const response = await apiClient.get<{
        resultCode: string
        msg: string
        data: ChatMessage[]
      }>(`/api/v1/messages/conversation/${projectId}/${freelancerId}`)

      if (response.data) {
        setMessages(response.data.data)
      }
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

      // Send to server
      const response = await apiClient.post<{
        resultCode: string
        msg: string
        data: ChatMessage
      }>('/api/v1/messages', {
        receiverId: freelancerId,
        relatedType: 'PROJECT',
        relatedId: projectId,
        content: content.trim()
      })

      // Replace temp message with server response
      if (response.data) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id ? response.data.data : msg
          )
        )
      }
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()))
      throw err
    }
  }, [projectId, freelancerId, currentUserId])

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
