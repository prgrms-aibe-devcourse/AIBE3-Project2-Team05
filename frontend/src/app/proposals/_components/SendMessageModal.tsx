'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog'
import { Button } from '@/ui/button'

interface SendMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (content: string) => Promise<void>
  receiverName: string
  projectTitle: string
}

export function SendMessageModal({
  open,
  onOpenChange,
  onSubmit,
  receiverName,
  projectTitle
}: SendMessageModalProps) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('메시지를 입력해주세요.')
      return
    }

    if (content.trim().length < 5) {
      alert('메시지는 최소 5자 이상 입력해주세요.')
      return
    }

    try {
      setIsSending(true)
      await onSubmit(content.trim())
      setContent('')
      onOpenChange(false)
      alert('메시지가 전송되었습니다.')
    } catch (error) {
      alert(error instanceof Error ? error.message : '메시지 전송에 실패했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>메시지 보내기</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>받는 사람: <span className="font-semibold">{receiverName}</span></p>
              <p>프로젝트: <span className="font-semibold">{projectTitle}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                메시지 * (최소 5자)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[200px] p-3 border rounded-md resize-none"
                placeholder="프로젝트에 관한 메시지를 입력하세요.&#10;&#10;예시:&#10;안녕하세요. 프로젝트 시작 전 미팅을 진행하고 싶습니다.&#10;편하신 일정을 알려주시면 감사하겠습니다."
                required
                minLength={5}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {content.length}자 {content.length < 5 && `(최소 5자 필요)`}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSending}>
              취소
            </Button>
            <Button type="submit" disabled={content.trim().length < 5 || isSending}>
              {isSending ? '전송 중...' : '메시지 전송'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
