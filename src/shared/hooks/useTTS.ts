import { useState, useEffect, useCallback, useRef } from 'react'

const TTS_CATEGORIES = ['attractions', 'culture', 'nature', 'springs']

export function useTTS(poiId: string, category: string) {
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supported = TTS_CATEGORIES.includes(category)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setSpeaking(false)
  }, [])

  const toggle = useCallback(() => {
    if (!supported) return
    if (speaking) {
      stop()
      return
    }
    const audio = new Audio(`/audio/pois/${poiId}.mp3`)
    audioRef.current = audio
    audio.onended = () => setSpeaking(false)
    audio.onerror = () => setSpeaking(false)
    audio.play().then(() => setSpeaking(true)).catch(() => setSpeaking(false))
  }, [supported, speaking, stop, poiId])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { speaking, toggle, supported }
}
