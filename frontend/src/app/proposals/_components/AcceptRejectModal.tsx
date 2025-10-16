'use client'

import { useState, useEffect } from 'react'

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

  // ESC 키로 모달 닫기
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
          maxWidth: '600px',
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
            {isAccept ? '제안 수락' : '제안 거절'}
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
            {/* Project Info */}
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              background: '#f9fafb',
              padding: '16px',
              borderRadius: '8px'
            }}>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{proposalInfo.projectTitle}</span> 프로젝트
              </p>
              <p>프리랜서: <span style={{ fontWeight: 600, color: '#374151' }}>{proposalInfo.freelancerName}</span></p>
            </div>

            {/* Message Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                {isAccept ? '응답 메시지 (선택)' : '거절 메시지 *'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required={!isAccept}
                placeholder={
                  isAccept
                    ? '제안을 수락하는 메시지를 입력하세요. (선택사항)'
                    : '제안을 거절하는 사유를 입력해주세요.'
                }
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#16a34a'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Rejection Reason (only for reject) */}
            {!isAccept && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  거절 사유 (선택)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="예: 다른 프리랜서 선정, 예산 부족 등"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>
            )}
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
              style={{
                background: isAccept ? '#16a34a' : '#dc2626',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isAccept ? '#15803d' : '#b91c1c'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isAccept ? '#16a34a' : '#dc2626'
              }}
            >
              {isAccept ? '수락하기' : '거절하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
