import { Badge } from '@/ui/badge'

type Status = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED'

interface StatusConfig {
  label: string
  className: string
}

const STATUS_CONFIG: Record<Status, StatusConfig> = {
  PENDING: {
    label: '대기중',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  ACCEPTED: {
    label: '수락됨',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  REJECTED: {
    label: '거절됨',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  CANCELED: {
    label: '취소됨',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
} as const

interface StatusBadgeProps {
  status: Status | string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as Status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  return <Badge className={config.className}>{config.label}</Badge>
}
