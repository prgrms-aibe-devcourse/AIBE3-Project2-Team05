'use client'

import Link from 'next/link'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { Button } from '@/ui/button'

export default function Header() {
  const { user, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
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
            <Link href="/projects" className="hover:text-primary transition-colors">
              프로젝트
            </Link>
            {user?.role === 'FREELANCER' && (
              <Link href="/submissions" className="hover:text-primary transition-colors">
                내 지원 목록
              </Link>
            )}
            {user && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l">
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
