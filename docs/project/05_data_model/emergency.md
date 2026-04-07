---
title: EmergencyContact — экстренный контакт
type: reference
audience: archimag, dev, content
owner: archimag
last_updated: 2026-04-07
---

# EmergencyContact

Контакт экстренной службы (полиция, скорая, больница, аптека).

## TypeScript

```ts
interface EmergencyContact {
  id: string
  type: 'police' | 'ambulance' | 'fire' | 'rescue' | 'hospital' | 'trauma' | 'pharmacy' | 'useful'
  name: LocalizedText
  phone: string
  alt_phone?: string
  location?: Location           // не у всех (общие номера типа 112)
  is_24h?: boolean
  notes?: LocalizedText
  created_at: string
  updated_at: string
}
```

## Группировка в UI

PWA `EmergencyPage` группирует по `type`:
- **Экстренные номера** — police/ambulance/fire/rescue (без location, общие на всю Россию)
- **Больницы** — hospital
- **Травмпункты** — trauma
- **Аптеки** — pharmacy (с `is_24h` фильтром)
- **Полезные контакты** — useful (туристический офис, посольства, ...)

## Источник

`public/content/emergency.json` — **nested object** (не array!) с группами `emergencyNumbers`, `hospitals`, `traumaCenters`, `pharmacies`, `usefulContacts`. `seed.ts` нормализует в плоский `EmergencyContact[]`. См. `../04_pwa_app/data_flow.md` → секция "Нормализация".

## БД

Таблица `public.emergency_contacts`. Public read, admin write.

## Where used

- **PWA**: `/emergency` (EmergencyPage)
- **brobrogid.ru**: `/emergency` (упрощённая версия)
- **Admin**: `/admin/emergency` CRUD

## Related

- `../04_pwa_app/data_flow.md` — нормализация nested JSON
- `transport.md` — аналогичная nested структура
