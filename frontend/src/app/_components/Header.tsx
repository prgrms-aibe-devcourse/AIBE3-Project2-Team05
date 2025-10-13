'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { Button } from '@/ui/button'
import { NotificationDropdown } from './NotificationDropdown'

export default function Header() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const handleMatchingServiceClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      alert('로그인이 필요한 서비스입니다.')
      router.push('/login')
    }
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            FIT Platform
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">
              홈
            </Link>
            <Link
              href="/projects"
              className="hover:text-primary transition-colors"
              onClick={handleMatchingServiceClick}
            >
              매칭 서비스
            </Link>
            {user?.role === 'FREELANCER' && (
              <Link href="/submissions" className="hover:text-primary transition-colors">
                내 지원 목록
              </Link>
            )}
            {user && user.role !== 'FREELANCER' && (
              <Link href="/applications" className="hover:text-primary transition-colors">
                지원자 관리
              </Link>
            )}
            {user && (
              <>
                <Link href="/proposals" className="hover:text-primary transition-colors">
                  제안 관리
                </Link>
                <Link href="/messages" className="hover:text-primary transition-colors">
                  메시지
                </Link>
              </>
            )}
            {user && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l">
                <NotificationDropdown />
                <span className="text-sm text-muted-foreground">
                  {user.nickname} ({user.role})
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            )}
            {!user && !isLoading && (
              <Link href="/login">
                <Button size="sm">로그인</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
