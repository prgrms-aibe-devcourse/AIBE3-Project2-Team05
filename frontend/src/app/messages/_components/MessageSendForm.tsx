'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'

interface MessageSendFormProps {
  projects: { id: number; title: string }[]
  onSend: (receiverId: number, relatedType: string, relatedId: number, content: string) => Promise<void>
}

export function MessageSendForm({ projects, onSend }: MessageSendFormProps) {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [receiverId, setReceiverId] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProject || !receiverId || !content.trim()) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSend(
        Number(receiverId),
        'PROJECT',
        selectedProject,
        content.trim()
      )
      // 초기화
      setContent('')
      alert('메시지가 전송되었습니다.')
    } catch (error) {
      alert(error instanceof Error ? error.message : '메시지 전송 실패')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 메시지 보내기</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              프로젝트 선택
            </label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              className="w-full px-4 py-2 border border-border rounded-md bg-background"
              required
            >
              <option value="">프로젝트를 선택하세요</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              받는 사람 ID
            </label>
            <input
              type="number"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              placeholder="받는 사람의 회원 ID"
              className="w-full px-4 py-2 border border-border rounded-md bg-background"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              * 메시지를 받을 사용자의 회원 ID를 입력하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              메시지 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="메시지 내용을 입력하세요"
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-md bg-background resize-none"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '전송 중...' : '메시지 보내기'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
