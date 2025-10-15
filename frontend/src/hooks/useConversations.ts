import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/backend/client'

export interface Conversation {
  projectId: number
  projectTitle: string
  freelancerId: number
  freelancerName: string
  pmId: number
  pmName: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<Conversation[]>('/api/v1/messages/conversations')

      // apiClient.get은 RsData를 자동으로 unwrap하므로 response.data가 곧 Conversation[]
      setConversations(response.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '대화방 목록을 불러오는데 실패했습니다.')
      console.error('Failed to fetch conversations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations
  }
}
