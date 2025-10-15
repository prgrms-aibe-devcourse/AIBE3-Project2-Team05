'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/app/context/UserContext'
import { apiClient } from '@/lib/backend/client'
import { useRouter } from 'next/navigation'
import { ProposalCard } from './_components/ProposalCard'
import { AcceptRejectModal } from './_components/AcceptRejectModal'
import { ChatModal } from '@/components/ChatModal'
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
  const { user, isLoading: authLoading } = useUser()
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'accept' | 'reject'>('accept')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [chatTarget, setChatTarget] = useState<{
    freelancerId: number
    receiverId: number  // 실제 수신자 회원 ID
    receiverName: string
    projectId: number
    projectTitle: string
  } | null>(null)
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null)

  const isPm = isFreelancer === false

  // Freelancer 여부 확인
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
          // RsData 응답: resultCode가 200으로 시작하면 프리랜서
          const isSuccess = data.resultCode?.startsWith('200')
          setIsFreelancer(isSuccess)
        } else {
          setIsFreelancer(false)
        }
      } catch {
        setIsFreelancer(false)
      }
    }

    checkRole()
  }, [user, authLoading])

  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.')
      router.push('/members/login')
      return
    }

    // isFreelancer가 null이면 아직 역할 확인 중
    if (isFreelancer === null) {
      return
    }

    if (!authLoading && user) {
      loadProposals()
    }
  }, [user, authLoading, isFreelancer, router])

  // URL 쿼리 파라미터에서 ID를 읽어서 해당 제안으로 스크롤
  useEffect(() => {
    if (proposals.length > 0) {
      const params = new URLSearchParams(window.location.search)
      const proposalId = params.get('id')
      if (proposalId) {
        // 약간의 딜레이 후 스크롤 (DOM 렌더링 대기)
        setTimeout(() => {
          const element = document.getElementById(`proposal-${proposalId}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // 하이라이트 효과
            element.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
            }, 3000)
          }
        }, 100)
      }
    }
  }, [proposals])

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

  const handleAccept = (id: number) => {
    const proposal = proposals.find(p => p.id === id)
    if (!proposal) return

    setSelectedProposal(proposal)
    setModalType('accept')
    setModalOpen(true)
  }

  const handleReject = (id: number) => {
    const proposal = proposals.find(p => p.id === id)
    if (!proposal) return

    setSelectedProposal(proposal)
    setModalType('reject')
    setModalOpen(true)
  }

  const handleModalSubmit = async (message: string, reason?: string) => {
    if (!selectedProposal) return

    try {
      if (modalType === 'accept') {
        await apiClient.put(`/api/v1/proposals/${selectedProposal.id}/accept`, {
          responseMessage: message
        })
        alert('제안을 수락했습니다.')
      } else {
        await apiClient.put(`/api/v1/proposals/${selectedProposal.id}/reject`, {
          responseMessage: message,
          rejectionReason: reason || ''
        })
        alert('제안을 거절했습니다.')
      }
      loadProposals()
    } catch (error) {
      alert(error instanceof Error ? error.message : '처리 실패')
    }
  }

  const handleSendMessage = (freelancerId: number, receiverId: number, receiverName: string, projectId: number, projectTitle: string) => {
    // 채팅 모달 열기
    setChatTarget({ freelancerId, receiverId, receiverName, projectId, projectTitle })
    setChatModalOpen(true)
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

  if (authLoading || isLoading || isFreelancer === null) {
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
            <div key={proposal.id} id={`proposal-${proposal.id}`}>
              <ProposalCard
                proposal={proposal}
                isPm={isPm}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
                onSendMessage={() => handleSendMessage(
                  proposal.freelancerId,  // conversation key (항상 프리랜서 ID)
                  isPm ? proposal.freelancerId : proposal.pmId,  // receiverId (실제 수신자 회원 ID)
                  isPm ? proposal.freelancerName : proposal.pmName,
                  proposal.projectId,
                  proposal.projectTitle
                )}
              />
            </div>
          ))}
        </div>
      )}

      {/* Accept/Reject Modal */}
      {selectedProposal && (
        <AcceptRejectModal
          type={modalType}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleModalSubmit}
          proposalInfo={{
            projectTitle: selectedProposal.projectTitle,
            freelancerName: selectedProposal.freelancerName
          }}
        />
      )}

      {/* Chat Modal */}
      {chatTarget && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          projectId={chatTarget.projectId}
          freelancerId={chatTarget.freelancerId}
          receiverId={chatTarget.receiverId}
          receiverName={chatTarget.receiverName}
          projectTitle={chatTarget.projectTitle}
        />
      )}
    </div>
  )
}
