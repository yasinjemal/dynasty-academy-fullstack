'use client'

import { useEffect } from 'react'

export default function SmoothScroll() {
  useEffect(() => {
    // Add smooth scroll behavior
    const handleScroll = () => {
      document.documentElement.style.scrollBehavior = 'smooth'
    }
    
    handleScroll()
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])
  
  return null
}
