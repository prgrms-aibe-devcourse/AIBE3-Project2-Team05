'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { apiClient } from '@/global/backend/client'
import { useRouter } from 'next/navigation'
import { ProposalCard } from './_components/ProposalCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface Proposal {
  id: number
  projectId: number
  projectTitle: string
  pmId: number
  pmName: string
  freelancerId: number
  freelancerName: string
  message: string
  status: string
  responseMessage?: string
  rejectionReason?: string
  responseDate?: string
  createdAt: string
  updatedAt: string
}

export default function ProposalsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isPm = user?.role !== 'FREELANCER'

  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!authLoading && user) {
      loadProposals()
    }
  }, [user, authLoading, router])

  const loadProposals = async () => {
    try {
      const response = await apiClient.get<Proposal[]>('/api/v1/proposals')
      setProposals(response.data)
    } catch (error) {
      console.error('Failed to load proposals:', error)
      alert(error instanceof Error ? error.message : '제안 목록 로딩 실패')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (id: number) => {
    const message = window.prompt('수락 메시지를 입력하세요 (선택):')

    try {
      await apiClient.put(`/api/v1/proposals/${id}/accept`, {
        responseMessage: message || '제안을 수락합니다.'
      })
      alert('제안을 수락했습니다.')
      loadProposals()
    } catch (error) {
      alert(error instanceof Error ? error.message : '수락 실패')
    }
  }

  const handleReject = async (id: number) => {
    const message = window.prompt('거절 메시지를 입력하세요:')
    if (!message || message.trim() === '') return

    const reason = window.prompt('거절 사유를 입력하세요 (선택):')

    try {
      await apiClient.put(`/api/v1/proposals/${id}/reject`, {
        responseMessage: message.trim(),
        rejectionReason: reason?.trim() || ''
      })
      alert('제안을 거절했습니다.')
      loadProposals()
    } catch (error) {
      alert(error instanceof Error ? error.message : '거절 실패')
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm('제안을 취소하시겠습니까?')) return

    try {
      await apiClient.delete(`/api/v1/proposals/${id}`)
      alert('제안이 취소되었습니다.')
      loadProposals()
    } catch (error) {
      alert(error instanceof Error ? error.message : '취소 실패')
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
      <h1 className="text-3xl font-bold mb-6">
        {isPm ? '보낸 제안 목록' : '받은 제안 목록'}
      </h1>

      {proposals.length === 0 ? (
        <EmptyState
          icon="📮"
          title={isPm ? '보낸 제안이 없습니다' : '받은 제안이 없습니다'}
          description={
            isPm
              ? '매칭 결과에서 프리랜서에게 제안을 보내보세요.'
              : '아직 받은 제안이 없습니다.'
          }
          action={
            isPm
              ? {
                  label: '매칭 서비스',
                  onClick: () => router.push('/projects')
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              isPm={isPm}
              onAccept={handleAccept}
              onReject={handleReject}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
