# BOARD

## INTENTION
Travel guide PWA (React-based, offline-first) for Vladikavkaz & North Ossetia.

## NOW
Explore content cards (tours, transport, etc.): copy to separate "info" folder, fill with real content from the internet.

## CONTEXT
Project is Vite+React+TypeScript PWA. Path: /home/cosmo/SOFT/COSMO/BROBROGID
Feature-based structure under src/features/. i18n ru/en. Zustand stores. Dexie/IndexedDB.
Admin panel fully i18n-ized. LanguageToggle in header. ~230 translation keys in ru.json/en.json under admin.* namespace.

## PINNED
- Stack is React-based (Vite+React, not Next.js) — required for future React Native portability
- MapLibre GL JS is the chosen map library

## NEXT
1. Code review / QA pass if requested

## ARCHITECTURE
Vite + React + TypeScript + Tailwind. Feature folders: explore, map, guides, tours, food,
emergency, ordering, poi, profile, saved, search, subscription, onboarding.
MapLibre GL JS + PMTiles. Dexie (IndexedDB). Zustand stores. i18n (en/ru).
Bottom tabs nav: Explore, Map, Saved, Food, Tours, Emergency, Profile.
Admin panel: auth (admin/bro1/bro2), full i18n, LanguageToggle.

## DONE
- Blueprint analyzed
- Project scaffolded and fully developed (commit ff66266)
- BOARD updated to reflect actual code state
- Documentation task initiated (prior session)
- Admin panel i18n (RU/EN) — все 20+ файлов мигрированы
- Auth для админки (admin/bro1/bro2)
- Fix seed.ts emergency/transport normalization
