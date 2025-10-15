'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface MemberDto {
  id: number
  username: string
  nickname: string
  email: string
  role: 'PM' | 'FREELANCER' | 'MEMBER'
}

interface AuthContextType {
  user: MemberDto | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MemberDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 로드 시 현재 사용자 정보 가져오기
  useEffect(() => {
    refreshUser()
  }, [])

  const refreshUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/me`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )
      if (res.ok) {
        const response = await res.json()
        setUser({
          id: response.data?.id,
          username: response.data?.username,
          nickname: response.data?.nickname,
          email: response.data?.email,
          role: response.data?.role || 'MEMBER'
        })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/login`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      }
    )
    if (res.ok) {
      const response = await res.json()
      setUser({
        id: response.data?.id,
        username: response.data?.username,
        nickname: response.data?.nickname,
        email: response.data?.email,
        role: response.data?.role || 'MEMBER'
      })
    } else {
      throw new Error('로그인 실패')
    }
  }

  const logout = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/logout`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
