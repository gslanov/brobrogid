# BOARD

## INTENTION
Travel guide PWA (React-based, offline-first). "Baby" web/PWA version first, then port to React Native mobile. Maps via MapLibre GL JS + PMTiles. Full POI system with categories, favorites, offline support, bottom sheet navigation.

## NOW
Project kickoff — architecture and stack decisions. Blueprint read and digested. No git repo yet. No code written.

## CONTEXT
Blueprint: /home/cosmo/Загрузки/travel_guide_blueprint.md
Key features from blueprint:
- 4-tab nav: Explore, Map, Saved/Trips, Profile
- Map + draggable bottom sheet (peek / half / full states)
- POI system: 8-10 top-level categories, 3 max per POI, tags for attributes
- Offline: PMTiles (IndexedDB), Workbox service worker, Cache-First for tiles
- iOS limits: 50MB Cache API, 7-day eviction, no bg location — handle defensively
- Progressive disclosure: card → expanded preview → full detail page
- Stack from blueprint: Next.js 14+ OR SvelteKit, MapLibre GL JS, Tailwind CSS, idb
- User wants React-based for easier React Native port later → lean toward Next.js + React

## PINNED
- Stack must be React-based (Next.js) — required for future React Native portability
- Start with PWA "baby" version, keep code portable
- MapLibre GL JS is the chosen map library (open-source, offline-capable)

## NEXT
1. Confirm stack details with user (Next.js App Router? Vite+React? State management?)
2. Initialize git repo and scaffold project
3. Implement core screens in order: Map view → Explore feed → POI detail → Saved

## ARCHITECTURE
Not yet defined. Decision pending stack confirmation.

## DONE
- Blueprint read and analyzed (/home/cosmo/Загрузки/travel_guide_blueprint.md)
- BOARD initialized
