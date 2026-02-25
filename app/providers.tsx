'use client'

import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isWidgetPage = pathname?.startsWith('/widget/')
  
  // Widget pages don't need authentication, so skip SessionProvider to avoid errors
  if (isWidgetPage) {
    return <>{children}</>
  }
  
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}
