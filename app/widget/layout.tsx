'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname?.startsWith('/widget')) return
    const prev = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
    }
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    return () => {
      document.body.style.margin = prev.margin
      document.body.style.padding = prev.padding
    }
  }, [pathname])

  return <>{children}</>
}
