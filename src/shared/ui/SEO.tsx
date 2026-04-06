import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

const BASE_URL = 'https://brobrogid.ru'

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'place'
  noindex?: boolean
}

export function SEO({ title, description, image, url, type = 'website', noindex }: SEOProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const fullUrl = url ? `${BASE_URL}${url}` : undefined
  const fullImage = image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : `${BASE_URL}/icons/icon-512.png`

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      {fullUrl && <meta property="og:url" content={fullUrl} />}
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={lang === 'ru' ? 'ru_RU' : 'en_US'} />
      <meta property="og:locale:alternate" content={lang === 'ru' ? 'en_US' : 'ru_RU'} />
      <meta property="og:site_name" content="BROBROGID" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical + hreflang */}
      {fullUrl && <link rel="canonical" href={fullUrl} />}
      {fullUrl && <link rel="alternate" hrefLang="ru" href={fullUrl} />}
      {fullUrl && <link rel="alternate" hrefLang="en" href={fullUrl} />}
      {fullUrl && <link rel="alternate" hrefLang="x-default" href={fullUrl} />}

      {/* Noindex */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
