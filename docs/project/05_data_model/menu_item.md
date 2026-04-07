---
title: MenuItem — позиция меню ресторана
type: reference
audience: archimag, dev, content
owner: archimag
last_updated: 2026-04-07
---

# MenuItem

Позиция меню ресторана (привязана к POI с `category=food`).

## TypeScript

```ts
interface MenuItem {
  id: string
  poi_id: string                // FK → pois.id
  section: 'starters' | 'mains' | 'desserts' | 'drinks' | 'sides' | 'specials'
  name: LocalizedText
  description?: LocalizedText
  price: {
    amount: number
    currency: 'RUB'
  }
  weight?: string               // '250г', '0.5л'
  photo?: string
  tags?: string[]               // 'vegan', 'spicy', 'gluten-free', ...
  is_available?: boolean        // временное отключение позиции
  created_at: string
  updated_at: string
}
```

## Бизнес-правила

1. **`poi_id` FK** на `pois`, parent должен иметь `category='food'` и `hasMenu=true`
2. `section` — enum с 6 значениями, влияет на группировку в UI
3. `is_available=false` → позиция показывается серой / скрыта
4. Цена в RUB всегда

## Where used

- **PWA**: `/poi/:slug/menu` (MenuPage)
- **brobrogid.ru**: на странице ресторана как табличка меню
- **Admin**: `/admin/menu-items` CRUD

## Total

275 позиций меню по ~30 ресторанам (на 2026-04).

## Related

- `poi.md` — родитель
- `../04_pwa_app/routing.md` — `/poi/:slug/menu` маршрут
