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
  | 'shopping'
  | 'nightlife'
  | 'transport'
  | 'activities'
  | 'practical'

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
  hasMenu: boolean
  hasDelivery: boolean
  externalOrderUrl?: string
}

export interface MenuItem {
  id: string
  poiId: string
  name: LocalizedText
  description: LocalizedText
  price: number
  currency: 'RUB'
  category: string
  photo?: string
  isPopular: boolean
  tags: string[]
}

export interface OrderItem {
  menuItemId: string
  quantity: number
  price: number
}

export type OrderStatus = 'cart' | 'pending' | 'paid' | 'confirmed'

export interface Order {
  id: string
  poiId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentMethod: 'sbp'
  createdAt: string
  comment?: string
}

export type TourType = 'walking' | 'driving' | 'mixed'
export type TourStatus = 'recruiting' | 'full' | 'completed'

export interface Tour {
  id: string
  name: LocalizedText
  description: LocalizedText
  guideId: string
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

export interface Guide {
  id: string
  name: LocalizedText
  bio: LocalizedText
  photo: string
  languages: string[]
  rating: number
  reviewCount: number
  tourCount: number
  specializations: string[]
}

export type ReviewTargetType = 'poi' | 'tour' | 'guide'

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
  type: 'bus' | 'marshrutka' | 'trolleybus'
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
}
