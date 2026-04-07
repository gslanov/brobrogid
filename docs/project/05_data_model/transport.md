---
title: TransportRoute — общественный транспорт
type: reference
audience: archimag, dev, content
owner: archimag
last_updated: 2026-04-07
---

# TransportRoute

Маршрут общественного транспорта или такси.

## TypeScript

```ts
interface TransportRoute {
  id: string
  type: 'bus' | 'marshrutka' | 'taxi' | 'rental' | 'tip'
  number?: string               // '15', '23А' (для bus/marshrutka)
  name: LocalizedText           // 'Площадь Свободы — Цей'
  stops?: TransportStop[]       // массив остановок
  schedule?: LocalizedText      // 'каждые 15 минут с 06:00 до 22:00'
  fare?: {
    amount: number
    currency: 'RUB'
  }
  contacts?: {
    phone?: string
    website?: string
  }
  notes?: LocalizedText
  created_at: string
  updated_at: string
}

interface TransportStop {
  name: LocalizedText
  location?: Location
}
```

## Источник

`public/content/transport.json` — nested object с группами `routes`, `taxis`, `tips`, `rentals`. Нормализуется `seed.ts` → плоский `TransportRoute[]` с `type` из имени группы.

## БД

Таблица `public.transport_routes`. Public read, admin write.

## Where used

- **PWA**: `/transport` (TransportPage) — TBD, может быть отдельная страница или секция в `/emergency`
- **Admin**: `/admin/transport` CRUD

## Related

- `emergency.md` — аналогичная nested структура
- `../04_pwa_app/data_flow.md` — нормализация
