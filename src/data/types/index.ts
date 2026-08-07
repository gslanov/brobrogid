export interface LocalizedText {
  ru: string
  en: string
}

export interface Location {
  lat: number
  lng: number
  address: LocalizedText
}

export type POICategory =
  | 'attractions'
  | 'food'
  | 'accommodation'
  | 'nature'
  | 'culture'
  | 'museums'

  | 'transport'
  | 'activities'
  | 'practical'
  | 'tours'

export type CuisineType = 'national' | 'european' | 'mixed'

export type PriceLevel = 1 | 2 | 3 | 4

export interface OperatingHours {
  mon?: string
  tue?: string
  wed?: string
  thu?: string
  fri?: string
  sat?: string
  sun?: string
}

export interface POI {
  id: string
  slug: string
  name: LocalizedText
  category: POICategory
  subcategory: string
  cuisineType?: CuisineType
  location: Location
  description: {
    short: LocalizedText
    medium: LocalizedText
    full: LocalizedText
  }
  photos: string[]
  rating: number
  reviewCount: number
  hours?: OperatingHours
  phone?: string
  website?: string
  priceLevel?: PriceLevel
  tags: string[]
  isChain: boolean
  subscriptionTier: 'free' | 'premium'
  visitCount: number
  hasDelivery: boolean
  externalOrderUrl?: string
  radius?: number
}


export type TourType = 'walking' | 'driving' | 'mixed'
export type TourStatus = 'recruiting' | 'full' | 'completed'

export interface Tour {
  id: string
  name: LocalizedText
  /** short — карточки/списки/SEO-мета, full — тело деталки тура. */
  description: {
    short: LocalizedText
    full: LocalizedText
  }
  /** Гидов как отдельной сущности в приложении нет — маршруты возят
   *  действующие турфирмы, они лежат среди мест (категория `tours`). */
  guideId?: string
  price: number
  duration: string
  type: TourType
  maxGroupSize: number
  currentGroupSize: number
  status: TourStatus
  dates: string[]
  meetingPoint: Location
  route: Array<{ lat: number; lng: number }>
  rating: number
  reviewCount: number
  photos: string[]
  category: string
}

export type ReviewTargetType = 'poi' | 'tour'

export interface Review {
  id: string
  targetType: ReviewTargetType
  targetId: string
  authorName: string
  authorAvatar?: string
  rating: number
  text: string
  date: string
  isGenerated: boolean
}

export type SubscriptionPlan = '1week' | '2weeks' | '3weeks'

export interface Subscription {
  plan: SubscriptionPlan
  price: number
  startDate: string
  endDate: string
  features: string[]
}

export type EmergencyType = 'police' | 'ambulance' | 'fire' | 'hospital' | 'trauma' | 'pharmacy'

export interface EmergencyContact {
  id: string
  type: EmergencyType
  name: LocalizedText
  phone: string
  location: Location
  is24h: boolean
}

export interface TransportRoute {
  id: string
  number: string
  name: LocalizedText
  type: 'bus' | 'marshrutka' | 'tram'
  stops: Array<{ name: LocalizedText; location: { lat: number; lng: number } }>
  schedule?: { weekday: string; weekend: string }
  color: string
}

export interface Collection {
  id: string
  name: string
  poiIds: string[]
  createdAt: string
}

export interface UserPreferences {
  language: 'ru' | 'en'
  visitedPois: string[]
  subscription?: Subscription
  directionsCounts: Record<string, number>
  callsCounts: Record<string, number>
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  endDate?: string
  time?: string
  image: string
  venue: string
  address?: string
  price?: string
  category?: string
  source: 'gorodzovet' | 'afishagoroda' | 'manual'
  sourceUrl: string
  fetchedAt: string
}
