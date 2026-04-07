---
title: Location — географическая точка
type: reference
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# Location

Координаты + опциональный адрес.

## Тип

```ts
interface Location {
  lat: number       // -90..90
  lng: number       // -180..180
  address?: LocalizedText
}
```

## Использование

- `POI.location` — обязательно
- `Guide` — нет (гид мобилен)
- `Tour.route[]` — массив `{lat, lng, name?}` для отрисовки маршрута
- `EmergencyContact.location` — опционально (не у всех)
- `TransportStop.location` — опционально

## БД

JSONB:
```sql
location jsonb NOT NULL  -- {"lat": 43.0298, "lng": 44.6812, "address": {...}}
```

Для геопоиска можно добавить PostGIS, но сейчас не используется. Для bounding-box фильтра — JSONB операторы достаточны (или клиентская фильтрация — 119 POI помещаются в memory).

## Карта

PWA использует `leaflet` с Yandex tiles:
```tsx
<Marker position={[poi.location.lat, poi.location.lng]} />
```

brobrogid.ru — статичные карты или iframe Yandex Maps.

## Координаты Владикавказа

Центр: `{lat: 43.0245, lng: 44.6810}` — для default zoom MapPage.

## Бизнес-правила

1. `lat`, `lng` — числа, не строки
2. Допустимые границы для North Ossetia: lat ∈ [42.5, 43.5], lng ∈ [43.5, 45.0] (мягкая валидация для CMS)
3. `address.ru` рекомендуется заполнять — показывается на карточке POI
4. Точность 4-6 знаков после запятой достаточна

## Validation

CHECK constraint в БД (TBD, не реализован):
```sql
ALTER TABLE pois ADD CONSTRAINT valid_location CHECK (
  (location->>'lat')::numeric BETWEEN -90 AND 90 AND
  (location->>'lng')::numeric BETWEEN -180 AND 180
);
```

## Related

- `poi.md`, `tour.md`, `emergency.md`, `transport.md` — где используется
- `../04_pwa_app/routing.md` → MapPage
