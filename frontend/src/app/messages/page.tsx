'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { apiClient } from '@/global/backend/client'
import { useRouter } from 'next/navigation'
import { MessageCard } from './_components/MessageCard'
import { MessageSendForm } from './_components/MessageSendForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/ui/button'

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

interface Project {
  id: number
  title: string
}

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSendForm, setShowSendForm] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!authLoading && user) {
      loadData()
    }
  }, [user, authLoading, router])

  const loadData = async () => {
    try {
      const [messagesRes, projectsRes] = await Promise.all([
        apiClient.get<Message[]>('/api/v1/messages'),
        apiClient.get<Project[]>('/api/v1/projects')
      ])
      setMessages(messagesRes.data)
      setProjects(projectsRes.data)
    } catch (error) {
      console.error('Failed to load data:', error)
      alert(error instanceof Error ? error.message : '데이터 로딩 실패')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (
    receiverId: number,
    relatedType: string,
    relatedId: number,
    content: string
  ) => {
    await apiClient.post('/api/v1/messages', {
      receiverId,
      relatedType,
      relatedId,
      content
    })
    loadData()
    setShowSendForm(false)
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiClient.put(`/api/v1/messages/${id}/read`)
      loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : '읽음 처리 실패')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">메시지</h1>
        <Button onClick={() => setShowSendForm(!showSendForm)}>
          {showSendForm ? '폼 닫기' : '메시지 보내기'}
        </Button>
      </div>

      {showSendForm && (
        <div className="mb-6">
          <MessageSendForm projects={projects} onSend={handleSendMessage} />
        </div>
      )}

      {messages.length === 0 ? (
        <EmptyState
          icon="💬"
          title="메시지가 없습니다"
          description="아직 주고받은 메시지가 없습니다."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              currentUserId={user?.id}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}
