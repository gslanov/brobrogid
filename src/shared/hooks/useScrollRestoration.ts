import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function getScroller(): HTMLElement | null {
  return document.getElementById('scroll-root')
}

export function useScrollRestoration() {
  const { key } = useLocation()

  useEffect(() => {
    const el = getScroller()
    if (!el) return

    // Restore saved position
    const saved = sessionStorage.getItem(`scroll:${key}`)
    if (saved) {
      const y = parseInt(saved, 10)
      requestAnimationFrame(() => { el.scrollTop = y })
    } else {
      el.scrollTop = 0
    }

    // Save position on every scroll
    const handleScroll = () => {
      sessionStorage.setItem(`scroll:${key}`, String(el.scrollTop))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
    }
  }, [key])
}
