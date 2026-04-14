import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

/**
 * Default site base URL. Matches the canonical domain declared in robots.txt
 * and the sitemap generator.
 */
const BASE_URL = 'https://brobrogid.ru'

/** Sensible defaults mirroring public/manifest.webmanifest */
const DEFAULT_TITLE = 'BROBROGID — Гид по Владикавказу и Северной Осетии'
const DEFAULT_DESCRIPTION =
  'Путеводитель по Владикавказу и Северной Осетии: достопримечательности, рестораны, туры, карта, гиды.'
const DEFAULT_OG_IMAGE = '/icons/icon-512.png'

export interface SEOProps {
  title?: string
  description?: string
  /** Canonical URL — may be absolute (https://...) or an app path (/foo). */
  canonical?: string
  /** Open Graph image — absolute or app path. */
  ogImage?: string
  ogType?: 'website' | 'article' | 'place' | 'profile'
  noindex?: boolean
  /** @deprecated use `ogImage` */
  image?: string
  /** @deprecated use `canonical` */
  url?: string
  /** @deprecated use `ogType` */
  type?: 'website' | 'article' | 'place' | 'profile'
}

function toAbsolute(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  return `${BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`
}

export function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType,
  noindex,
  image,
  url,
  type,
}: SEOProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language || 'ru'

  const finalTitle = title || DEFAULT_TITLE
  const finalDescription = description || DEFAULT_DESCRIPTION
  const finalOgType = ogType || type || 'website'
  const finalCanonical = toAbsolute(canonical || url)
  const finalOgImage =
    toAbsolute(ogImage || image) || `${BASE_URL}${DEFAULT_OG_IMAGE}`

  return (
    <Helmet>
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />

      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      {finalCanonical && <meta property="og:url" content={finalCanonical} />}
      <meta property="og:type" content={finalOgType} />
      <meta property="og:locale" content={lang === 'ru' ? 'ru_RU' : 'en_US'} />
      <meta
        property="og:locale:alternate"
        content={lang === 'ru' ? 'en_US' : 'ru_RU'}
      />
      <meta property="og:site_name" content="BROBROGID" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Canonical + hreflang */}
      {finalCanonical && <link rel="canonical" href={finalCanonical} />}
      {finalCanonical && (
        <link rel="alternate" hrefLang="ru" href={finalCanonical} />
      )}
      {finalCanonical && (
        <link rel="alternate" hrefLang="en" href={finalCanonical} />
      )}
      {finalCanonical && (
        <link rel="alternate" hrefLang="x-default" href={finalCanonical} />
      )}

      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
