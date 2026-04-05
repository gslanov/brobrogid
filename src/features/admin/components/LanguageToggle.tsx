import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

  function toggle() {
    const newLang = currentLang === 'ru' ? 'en' : 'ru'
    i18n.changeLanguage(newLang)
    useDataStore.getState().setLanguage(newLang)
  }

  return (
    <button
      onClick={toggle}
      className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
    >
      {currentLang === 'ru' ? 'RU' : 'EN'}
    </button>
  )
}
