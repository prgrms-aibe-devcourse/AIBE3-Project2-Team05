'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/global/auth/hooks/useAuth'
import { apiClient } from '@/global/backend/client'
import { Card } from '@/ui/card'
import { Button } from '@/ui/button'
import Link from 'next/link'

interface Project {
  id: number
  title: string
  description: string
  budget: number
  startDate: string
  endDate: string
  status: string
  pmName: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await apiClient.get<Project[]>('/api/v1/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">프로젝트 목록</h1>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          등록된 프로젝트가 없습니다.
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">예산</span>
                    <span className="font-semibold">{project.budget?.toLocaleString()}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">기간</span>
                    <span>
                      {project.startDate} ~ {project.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PM</span>
                    <span>{project.pmName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">상태</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                      {project.status}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-2">
                  <Link href={`/matching/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      매칭 결과 보기
                    </Button>
                  </Link>
                  {user?.role === 'FREELANCER' && (
                    <Button className="flex-1" onClick={() => router.push(`/projects/${project.id}/apply`)}>
                      지원하기
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
