'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/global/backend/client'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { Badge } from '@/ui/badge'

interface Notification {
  id: number
  notificationType: string
  title: string
  content: string
  relatedType?: string
  relatedId?: number
  isRead: boolean
  createdAt: string
}

const NOTIFICATION_TYPE_ICONS = {
  PROPOSAL_RECEIVED: '📨',
  PROPOSAL_ACCEPTED: '✅',
  PROPOSAL_REJECTED: '❌',
  MESSAGE_RECEIVED: '💬',
  SUBMISSION_ACCEPTED: '🎉',
  SUBMISSION_REJECTED: '😔'
} as const

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadUnreadCount()
    // 30초마다 읽지 않은 알림 개수 갱신
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  const loadUnreadCount = async () => {
    try {
      const response = await apiClient.get<{ count: number }>('/api/v1/notifications/unread-count')
      setUnreadCount(response.data.count)
    } catch (error) {
      // 에러 무시 (로그인 안 된 경우 등)
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await apiClient.get<Notification[]>('/api/v1/notifications')
      setNotifications(response.data)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiClient.put(`/api/v1/notifications/${id}/read`)
      loadNotifications()
      loadUnreadCount()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/api/v1/notifications/read-all')
      loadNotifications()
      loadUnreadCount()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/v1/notifications/${id}`)
      loadNotifications()
      loadUnreadCount()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_TYPE_ICONS[type as keyof typeof NOTIFICATION_TYPE_ICONS] || '🔔'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          🔔
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="font-semibold">알림</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleMarkAllAsRead}
            >
              모두 읽음
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            알림이 없습니다
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer ${
                !notification.isRead ? 'bg-muted/50' : ''
              }`}
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getNotificationIcon(notification.notificationType)}</span>
                    <span className="text-sm font-semibold">{notification.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {notification.content}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <div className="flex gap-1">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      ✓
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDelete(notification.id)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
