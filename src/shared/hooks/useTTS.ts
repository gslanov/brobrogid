import { useState, useEffect, useCallback } from 'react'

export function useTTS(text: string, lang: string) {
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const toggle = useCallback(() => {
    if (!supported) return
    if (speaking) {
      stop()
    } else {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.85
      utterance.pitch = 0
      utterance.volume = 1

      // Выбираем мужской голос если доступен
      const voices = window.speechSynthesis.getVoices()
      const maleKeywords = ['male', 'man', 'pavel', 'dmitri', 'yuri', 'google русский', 'microsoft pavel', 'microsoft dmitry']
      const langCode = lang.split('-')[0]
      const langVoices = voices.filter(v => v.lang.startsWith(langCode))
      const maleVoice = langVoices.find(v =>
        maleKeywords.some(k => v.name.toLowerCase().includes(k))
      ) ?? langVoices[0]
      if (maleVoice) utterance.voice = maleVoice

      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setSpeaking(true)
    }
  }, [supported, speaking, text, lang, stop])

  // Останавливаем при уходе со страницы
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  return { speaking, toggle, supported }
}
