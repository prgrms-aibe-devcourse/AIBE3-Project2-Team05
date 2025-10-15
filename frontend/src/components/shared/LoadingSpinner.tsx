interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CONFIG = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-32 h-32'
} as const

export function LoadingSpinner({ message = '로딩 중...', size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className={`${SIZE_CONFIG[size]} border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
