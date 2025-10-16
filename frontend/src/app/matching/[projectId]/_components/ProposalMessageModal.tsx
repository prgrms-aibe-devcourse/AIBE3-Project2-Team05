'use client'

import { useState, useEffect } from 'react'

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

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open])

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

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '20px'
      }}
      onClick={handleCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#111',
            margin: 0
          }}>
            프리랜서에게 제안하기
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{freelancerName}</span> 프리랜서에게 제안 메시지를 보냅니다.
              </p>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                제안 메시지 * (최소 10자)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`프로젝트에 대한 소개와 함께 프리랜서에게 제안하고 싶은 내용을 작성해주세요.

예시:
안녕하세요. [프로젝트명] 프로젝트의 PM입니다.
귀하의 [기술스택] 경험과 포트폴리오를 보고 이 프로젝트에 적합하다고 판단하여 제안 드립니다.
프로젝트 세부 사항을 논의하고 싶습니다. 관심 있으시면 회신 부탁드립니다.`}
                required
                minLength={10}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  lineHeight: '1.6'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#16a34a'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
              <div style={{
                fontSize: '12px',
                color: message.length < 10 ? '#dc2626' : '#999',
                marginTop: '4px'
              }}>
                {message.length}자 {message.length < 10 && '(최소 10자 필요)'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 28px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: '#fff',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={message.trim().length < 10}
              style={{
                background: message.trim().length < 10 ? '#9ca3af' : '#16a34a',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: message.trim().length < 10 ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: message.trim().length < 10 ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (message.trim().length >= 10) {
                  e.currentTarget.style.background = '#15803d'
                }
              }}
              onMouseOut={(e) => {
                if (message.trim().length >= 10) {
                  e.currentTarget.style.background = '#16a34a'
                }
              }}
            >
              제안 보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
