'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Card, CardHeader, CardContent } from '@/ui/card'
import { Label } from '@/ui/label'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요')
      return
    }

    try {
      setIsLoading(true)
      await login(username, password)
      router.push('/')
    } catch (error: any) {
      alert(error.message || '로그인 실패')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">로그인</h1>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">FIT 플랫폼 로그인</h2>
            <p className="text-sm text-muted-foreground">
              아이디와 비밀번호를 입력하세요
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={!username || !password || isLoading}
                className="w-full"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">테스트 계정</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• PM 계정: pm1, pm2 (비밀번호: 1234)</p>
                <p>• 프리랜서: freelancer1~5 (비밀번호: 1234)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
