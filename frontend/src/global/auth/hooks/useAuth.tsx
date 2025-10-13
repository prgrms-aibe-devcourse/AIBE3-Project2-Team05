'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient, RsData } from '@/global/backend/client'

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
      const response = await apiClient.get<MemberDto>('/api/v1/auth/me')
      setUser(response.data)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await apiClient.post<MemberDto>('/api/v1/auth/login', { username, password })
    setUser(response.data)
  }

  const logout = async () => {
    await apiClient.post('/api/v1/auth/logout')
    setUser(null)
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
