"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { name: "홈", href: "/" },
  { name: "프로젝트 둘러보기", href: "/projects" },
  { name: "프로젝트 등록", href: "/projects/create" },
  { name: "내 프로젝트", href: "/user-projects" },
]

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(145deg, #f1f5f9 0%, #e0e7ff 100%)' }}>
      {/* Header */}
      <header className="bg-white shadow-xl border-b-2 border-blue-100/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* FIT Name - Left aligned */}
            <Link href="/" className="flex items-center group">
              <div className="flex flex-col">
                <span
                  className="text-3xl font-extrabold text-blue-600 tracking-tight"
                  style={{ fontFamily: '"Poppins", "Noto Sans KR", sans-serif' }}
                >
                  FIT
                </span>
                <span
                  className="text-sm text-gray-600 font-medium tracking-wide"
                  style={{ fontFamily: '"Poppins", "Noto Sans KR", sans-serif' }}
                >
                  Freelancer In Talent
                </span>
              </div>
            </Link>

            {/* Navigation Bar - Right aligned with separators and more spacing */}
            <nav className="flex items-center space-x-8">
              {navItems.map((item, index) => (
                <div key={item.name + index} className="flex items-center space-x-1">
                  <Link
                    href={item.href}
                    className={`px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                      pathname === item.href
                        ? "text-white shadow-md bg-gradient-to-r from-blue-500 to-purple-500"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/50"
                    }`}
                    style={{
                      fontFamily: '"Poppins", "Noto Sans KR", sans-serif',
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {item.name}
                  </Link>
                  {index < navItems.length - 1 && (
                    <span className="text-gray-300 font-bold text-sm px-2">/</span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t shadow-md mt-auto" style={{ borderColor: '#e5e7eb' }}>
        <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
              >
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <p
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: '"Poppins", "Noto Sans KR", sans-serif' }}
              >
                © 2025 FIT. 모든 권리 보유.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}