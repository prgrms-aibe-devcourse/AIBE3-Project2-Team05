import { Badge } from '@/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import type { FreelancerRecommendationDto } from '@/global/backend/apiV1/types'

interface FreelancerProfileModalProps {
  freelancer: FreelancerRecommendationDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PROFICIENCY_CONFIG = {
  EXPERT: {
    label: '특급',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  ADVANCED: {
    label: '고급',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  INTERMEDIATE: {
    label: '중급',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  BEGINNER: {
    label: '초급',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
} as const

export function FreelancerProfileModal({
  freelancer,
  open,
  onOpenChange
}: FreelancerProfileModalProps) {
  if (!freelancer) return null

  const getProficiencyInfo = (proficiency: string) => {
    return PROFICIENCY_CONFIG[proficiency as keyof typeof PROFICIENCY_CONFIG] || {
      label: proficiency,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{freelancer.freelancerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">경력:</span>
                <span className="ml-2 font-medium">
                  {freelancer.totalExperience > 0
                    ? `${freelancer.totalExperience}년`
                    : '신입'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">완료 프로젝트:</span>
                <span className="ml-2 font-medium">
                  {freelancer.completedProjects}개
                </span>
              </div>
              {freelancer.averageRating > 0 && (
                <div>
                  <span className="text-muted-foreground">평점:</span>
                  <span className="ml-2 font-medium">
                    ⭐ {freelancer.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">매칭 점수:</span>
                <span className="ml-2 font-medium text-primary">
                  {freelancer.matchingScore.toFixed(1)}점 (#{freelancer.rank}위)
                </span>
              </div>
            </div>
          </div>

          {/* 보유 기술 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">보유 기술</h3>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill, index) => {
                const info = getProficiencyInfo(skill.proficiency)
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={info.className}
                  >
                    {skill.techName} ({info.label})
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* 점수 상세 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">점수 상세</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="flex-1">
                  <span className="text-sm">스킬 매칭</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(freelancer.skillScore / 50) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {freelancer.skillScore.toFixed(1)} / 50
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <span className="text-sm">경력</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(freelancer.experienceScore / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {freelancer.experienceScore.toFixed(1)} / 30
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <span className="text-sm">단가</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(freelancer.budgetScore / 20) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {freelancer.budgetScore.toFixed(1)} / 20
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 희망 단가 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">희망 단가</h3>
            <div className="text-sm">
              <span className="font-medium text-lg">
                {freelancer.minRate.toLocaleString()} ~ {freelancer.maxRate.toLocaleString()}
              </span>
              <span className="text-muted-foreground ml-2">원/시간</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
