'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog'
import { Button } from '@/ui/button'

interface AcceptRejectModalProps {
  type: 'accept' | 'reject'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (message: string, reason?: string) => void
  proposalInfo: {
    projectTitle: string
    freelancerName: string
  }
}

export function AcceptRejectModal({
  type,
  open,
  onOpenChange,
  onSubmit,
  proposalInfo
}: AcceptRejectModalProps) {
  const [message, setMessage] = useState('')
  const [reason, setReason] = useState('')

  const isAccept = type === 'accept'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (type === 'reject' && !message.trim()) {
      alert('거절 메시지를 입력해주세요.')
      return
    }

    onSubmit(message.trim() || (isAccept ? '제안을 수락합니다.' : ''), reason.trim())
    setMessage('')
    setReason('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setMessage('')
    setReason('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isAccept ? '제안 수락' : '제안 거절'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <span className="font-semibold">{proposalInfo.projectTitle}</span> 프로젝트
              </p>
              <p>프리랜서: <span className="font-semibold">{proposalInfo.freelancerName}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isAccept ? '응답 메시지 (선택)' : '거절 메시지 *'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[120px] p-3 border rounded-md resize-none"
                placeholder={
                  isAccept
                    ? '제안을 수락하는 메시지를 입력하세요. (선택사항)'
                    : '제안을 거절하는 사유를 입력해주세요.'
                }
                required={!isAccept}
              />
            </div>

            {!isAccept && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  거절 사유 (선택)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border rounded-md"
                  placeholder="예: 다른 프리랜서 선정, 예산 부족 등"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" variant={isAccept ? "default" : "destructive"}>
              {isAccept ? '수락하기' : '거절하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
