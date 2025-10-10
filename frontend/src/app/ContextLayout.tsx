"use client"

import ClientLayout from "./ClientLayout"

export default function ContextLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <ClientLayout>{children}</ClientLayout>
  )
}
