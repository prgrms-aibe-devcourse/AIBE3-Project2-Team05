"use client"

import Link from "next/link"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <header>
        <nav className="flex">
          <Link href="/" className="p-2 rounded hover:bg-gray-100">
            홈
          </Link>
          <Link href="/posts" className="p-2 rounded hover:bg-gray-100">
            글목록
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="text-center p-2">풋터</footer>
    </>
  )
}