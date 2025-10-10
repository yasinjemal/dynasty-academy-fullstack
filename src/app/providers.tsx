'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/contexts/CartContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
