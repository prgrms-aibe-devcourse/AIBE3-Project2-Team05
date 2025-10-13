import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import type { FreelancerRecommendationDto } from '@/global/backend/apiV1/types'

interface FreelancerCardProps {
  freelancer: FreelancerRecommendationDto
  onPropose?: () => void
  isPm?: boolean
}

export function FreelancerCard({ freelancer, onPropose, isPm = false }: FreelancerCardProps) {
  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'EXPERT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ADVANCED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{freelancer.freelancerName}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {freelancer.totalExperience > 0
                  ? `${freelancer.totalExperience}년 경력`
                  : '신입'}
              </span>
              <span>•</span>
              <span>완료 프로젝트: {freelancer.completedProjects}개</span>
              {freelancer.averageRating > 0 && (
                <>
                  <span>•</span>
                  <span>⭐ {freelancer.averageRating.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {freelancer.matchingScore.toFixed(1)}점
            </div>
            <div className="text-xs text-muted-foreground">#{freelancer.rank}위</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skill Tags */}
        <div>
          <h4 className="text-sm font-semibold mb-2">보유 기술</h4>
          <div className="flex flex-wrap gap-2">
            {freelancer.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={getProficiencyColor(skill.proficiency)}
              >
                {skill.techName} ({skill.proficiency})
              </Badge>
            ))}
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h4 className="text-sm font-semibold mb-2">점수 상세</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">스킬 매칭</span>
              <span className="font-medium">
                {freelancer.skillScore.toFixed(1)} / 50
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">경력</span>
              <span className="font-medium">
                {freelancer.experienceScore.toFixed(1)} / 30
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">단가</span>
              <span className="font-medium">
                {freelancer.budgetScore.toFixed(1)} / 20
              </span>
            </div>
          </div>
        </div>

        {/* Rate Range */}
        <div>
          <h4 className="text-sm font-semibold mb-2">희망 단가</h4>
          <div className="text-sm">
            <span className="font-medium">
              {freelancer.minRate.toLocaleString()} ~ {freelancer.maxRate.toLocaleString()}
            </span>
            <span className="text-muted-foreground"> 원/시간</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isPm && (
            <Button onClick={onPropose} className="flex-1">
              제안하기
            </Button>
          )}
          <Button variant="outline" className={isPm ? "flex-1" : "w-full"}>
            프로필 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
