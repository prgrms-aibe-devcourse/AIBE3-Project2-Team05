'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatMessages } from '@/hooks/useChatMessages'
import { useUser } from '@/app/context/UserContext'
import { apiClient } from '@/lib/backend/client'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  freelancerId: number
  receiverId: number  // 실제 수신자 회원 ID
  receiverName: string
  projectTitle: string
}

export function ChatModal({
  isOpen,
  onClose,
  projectId,
  freelancerId,
  receiverId,
  receiverName,
  projectTitle
}: ChatModalProps) {
  const { user } = useUser()
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, error, sendMessage, refetch } = useChatMessages({
    projectId,
    freelancerId,
    receiverId,  // receiverId 추가
    currentUserId: user?.id || 0,
    isOpen
  })

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 대화방 열 때 자동 읽음 처리
  useEffect(() => {
    if (isOpen && projectId && freelancerId) {
      const markAsRead = async () => {
        try {
          await apiClient.put(
            `/api/v1/messages/conversation/${projectId}/${freelancerId}/read`,
            {}
          )
        } catch (err) {
          console.error('Failed to mark messages as read:', err)
        }
      }
      markAsRead()
    }
  }, [isOpen, projectId, freelancerId])

  // 폴링 방식 실시간 업데이트 (5초마다)
  useEffect(() => {
    if (!isOpen) return

    const pollingInterval = setInterval(() => {
      refetch()
    }, 5000) // 5초마다 새 메시지 확인

    return () => clearInterval(pollingInterval)
  }, [isOpen, refetch])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim() || inputMessage.trim().length < 5) {
      alert('메시지는 최소 5자 이상 입력해주세요.')
      return
    }

    setIsSending(true)
    try {
      await sendMessage(inputMessage)
      setInputMessage('')
    } catch (err) {
      alert(err instanceof Error ? err.message : '메시지 전송에 실패했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? '오후' : '오전'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes

    return `${ampm} ${displayHours}:${displayMinutes}`
  }

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

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
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          maxWidth: '500px',
          width: '100%',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            padding: '4px',
            zIndex: 10
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>

        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#111',
            margin: 0
          }}>
            {receiverName}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginTop: '4px'
          }}>
            {projectTitle}
          </p>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: '#fff',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
          }}
        >
          {isLoading && (
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '32px 0'
            }}>
              메시지를 불러오는 중...
            </div>
          )}

          {error && (
            <div style={{
              textAlign: 'center',
              color: '#dc2626',
              padding: '32px 0'
            }}>
              {error}
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '32px 0'
            }}>
              첫 메시지를 보내보세요!
            </div>
          )}

          {!isLoading &&
            !error &&
            messages.map((message) => {
              const isMine = message.senderId === user?.id
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '70%'
                    }}
                  >
                    {!isMine && (
                      <span style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '4px'
                      }}>
                        {message.senderName}
                      </span>
                    )}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}>
                      {isMine && (
                        <span style={{
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {formatTimestamp(message.createdAt)}
                        </span>
                      )}
                      <div
                        style={{
                          borderRadius: '8px',
                          padding: '8px 16px',
                          background: isMine ? '#16a34a' : '#f3f4f6',
                          color: isMine ? '#fff' : '#111'
                        }}
                      >
                        <p style={{
                          fontSize: '14px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          margin: 0
                        }}>
                          {message.content}
                        </p>
                      </div>
                      {!isMine && (
                        <span style={{
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {formatTimestamp(message.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '24px 28px',
            borderTop: '1px solid #e5e7eb',
            background: '#fff'
          }}
        >
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              disabled={isSending}
              minLength={5}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#16a34a'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              style={{
                background: (isSending || !inputMessage.trim()) ? '#9ca3af' : '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (isSending || !inputMessage.trim()) ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: (isSending || !inputMessage.trim()) ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!isSending && inputMessage.trim()) {
                  e.currentTarget.style.background = '#15803d'
                }
              }}
              onMouseOut={(e) => {
                if (!isSending && inputMessage.trim()) {
                  e.currentTarget.style.background = '#16a34a'
                }
              }}
            >
              {isSending ? '전송 중...' : '전송'}
            </button>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '8px'
          }}>
            최소 5자 이상 입력해주세요
          </p>
        </form>
      </div>
    </div>
  )
}
