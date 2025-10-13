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

const ITEMS_PER_PAGE = 9

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
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

  // 페이징 계산
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProjects = projects.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">프로젝트 목록</h1>
        <div className="text-sm text-muted-foreground">
          총 {projects.length}개 프로젝트
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          등록된 프로젝트가 없습니다.
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {currentProjects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
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
                </div>

                <div className="pt-4 mt-4 border-t flex gap-2">
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
              </Card>
            ))}
          </div>

          {/* 페이징 UI */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
