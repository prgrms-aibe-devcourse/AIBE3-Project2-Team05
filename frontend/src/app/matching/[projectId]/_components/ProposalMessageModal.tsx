'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog'
import { Button } from '@/ui/button'

interface ProposalMessageModalProps {
  freelancerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (message: string) => void
}

export function ProposalMessageModal({
  freelancerName,
  open,
  onOpenChange,
  onSubmit
}: ProposalMessageModalProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      alert('제안 메시지를 입력해주세요.')
      return
    }

    if (message.trim().length < 10) {
      alert('제안 메시지는 최소 10자 이상 입력해주세요.')
      return
    }

    onSubmit(message.trim())
    setMessage('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>프리랜서에게 제안하기</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-semibold">{freelancerName}</span> 프리랜서에게 제안 메시지를 보냅니다.
              </p>
              <label className="block text-sm font-medium mb-2">
                제안 메시지 * (최소 10자)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[200px] p-3 border rounded-md resize-none"
                placeholder="프로젝트에 대한 소개와 함께 프리랜서에게 제안하고 싶은 내용을 작성해주세요.

예시:
안녕하세요. [프로젝트명] 프로젝트의 PM입니다.
귀하의 [기술스택] 경험과 포트폴리오를 보고 이 프로젝트에 적합하다고 판단하여 제안 드립니다.
프로젝트 세부 사항을 논의하고 싶습니다. 관심 있으시면 회신 부탁드립니다."
                required
                minLength={10}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {message.length}자 {message.length < 10 && `(최소 10자 필요)`}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" disabled={message.trim().length < 10}>
              제안 보내기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
