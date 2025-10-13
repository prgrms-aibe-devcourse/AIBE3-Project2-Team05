import Link from 'next/link'
import { Button } from '@/ui/button'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            FIT Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Freelancer IT Matching Platform
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            프로젝트에 최적화된 프리랜서를 찾아보세요
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 pt-8">
          <Link href="/projects">
            <Button size="lg" className="text-lg px-8">
              프로젝트 둘러보기
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            PM은 프로젝트를 등록하고, 프리랜서는 프로젝트에 지원할 수 있습니다
          </p>
        </div>

        {/* Test Accounts */}
        <div className="pt-8 border-t">
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              테스트 계정 정보 보기
            </summary>
            <div className="mt-4 space-y-4 text-sm">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">PM 계정 (프로젝트 매니저)</h4>
                <div className="space-y-1 font-mono text-xs">
                  <p>Username: <span className="text-primary">pm1</span></p>
                  <p>Password: <span className="text-primary">password</span></p>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">프리랜서 계정</h4>
                <div className="space-y-1 font-mono text-xs">
                  <p>Username: <span className="text-primary">freelancer1</span></p>
                  <p>Password: <span className="text-primary">password</span></p>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
