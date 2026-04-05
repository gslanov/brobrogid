# BROBROGID — Step-by-Step Implementation Plan

> **How to use this document:** Go step by step, top to bottom. Each step has a clear scope, lists the files to touch, and states what "done" looks like. Do NOT skip steps — later steps depend on earlier ones. After completing each step, check off the box and move to the next.
>
> **Effort legend:** ⚡ < 30 min | 🔧 30–90 min | 🔨 2–4 hours | 🏗️ 4–8 hours | 🏛️ 1–2 days

---

## PHASE 0: Foundation (do this first, everything depends on it)

### Step 0.1 ⚡ — Create design tokens CSS variables

**Why first:** Every visual change in the entire plan references these tokens. Without them, you'll hardcode values and then refactor later. Do it once, do it now.

**Files to edit:**
- `src/index.css`

**What to do:**
Replace the current `:root` block with the full token system:

```css
:root {
  /* Colors */
  --color-primary: #1A73E8;
  --color-primary-light: #E8F0FE;
  --color-text: #1B1F23;
  --color-text-secondary: #64748B;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-danger: #DC2626;
  --color-accent: #E85D26;

  /* Spacing (8pt grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Elevation */
  --shadow-1: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-2: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-3: 0 4px 16px rgba(0,0,0,0.12);
  --shadow-4: 0 8px 32px rgba(0,0,0,0.16);

  /* Layout */
  --bottom-nav-height: 56px;
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);

  /* Animation */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --duration-micro: 150ms;
  --duration-small: 200ms;
  --duration-standard: 300ms;
  --duration-large: 400ms;
}
```

Also add reduced motion support at the bottom of `index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Done when:** All old CSS vars still work (aliases if needed), new tokens are available globally, reduced motion media query is in place.

---

### Step 0.2 ⚡ — Set up Inter font

**Why now:** Typography is the backbone. Switching font before building new components avoids double work.

**Files to edit:**
- `index.html` (add preload link)
- `src/index.css` (update body font-family)

**What to do:**
Add to `<head>` in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Update body in `index.css`:
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

**Done when:** App renders in Inter. Cyrillic characters display correctly.

---

### Step 0.3 🔧 — Build Skeleton component

**Why now:** Skeleton screens are used on EVERY page. Build the primitive once.

**Files to create:**
- `src/shared/ui/Skeleton.tsx`

**What to do:**
Build a reusable `<Skeleton>` component with these variants:
- `<Skeleton variant="text" width="80%" />` — single text line
- `<Skeleton variant="rect" width={200} height={130} />` — rectangular block (for images)
- `<Skeleton variant="circle" size={48} />` — circular (for avatars)

Use the shimmer animation from the spec:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

The component should accept `className` for custom sizing via Tailwind.

Also create preset composites:
- `<POICardSkeleton variant="horizontal" />` — matches horizontal POICard layout
- `<POICardSkeleton variant="vertical" />` — matches vertical POICard layout

**Done when:** `<Skeleton>` renders animated shimmer shapes. `<POICardSkeleton>` matches the exact dimensions of `<POICard>`.

---

### Step 0.4 🔧 — Build Toast notification system

**Why now:** Many later steps need to show feedback (save confirmation, offline notice, errors). Build the channel once.

**Files to create:**
- `src/shared/ui/Toast.tsx`
- `src/data/stores/toast-store.ts`

**What to do:**
Create a Zustand store for toasts:
```ts
interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  action?: { label: string; onClick: () => void }; // for "Undo" etc
  duration?: number; // default 4000ms
}
```

Create a `<ToastContainer>` component that renders at the bottom of `AppShell` (above tab bar). Toasts slide up, auto-dismiss, swipe-to-dismiss.

Export a `useToast()` hook:
```ts
const toast = useToast();
toast.show("Saved!", { type: "success" });
toast.show("You're offline", { type: "warning", duration: 0 }); // persistent
```

**Done when:** Calling `toast.show()` from any component renders an animated toast. Auto-dismisses after 4s. Can be swiped away.

---

### Step 0.5 🔧 — Global focus-visible styles + a11y foundation

**Why now:** Every interactive element built from here on should have proper focus states from the start.

**Files to edit:**
- `src/index.css`

**What to do:**
Add global focus-visible styles:
```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove default outlines for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}
```

Add scroll-margin for sticky headers:
```css
[id] {
  scroll-margin-top: 72px; /* header height + buffer */
  scroll-margin-bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom) + 16px);
}
```

**Done when:** Tabbing through the app shows clear blue outline on every interactive element. Mouse clicks don't show outlines.

---

### Step 0.6 🔧 — Create ImageWithFallback component

**Why now:** Image error handling is currently scattered as inline `onError` handlers across 10+ files. Centralize it.

**Files to create:**
- `src/shared/ui/ImageWithFallback.tsx`

**What to do:**
Build a component that wraps `<img>` with:
1. Shows `<Skeleton variant="rect">` while loading
2. On load success: fade in (200ms opacity transition)
3. On error: shows styled placeholder with the POI/tour name on a colored background
4. Accepts `alt` (required), `fallbackText`, `aspectRatio` props

Replace all inline `onError` handlers across the codebase with this component in later steps.

**Done when:** Component renders skeleton → image (or fallback). No broken image icons anywhere it's used.

---

## PHASE 1: Global Shell & Navigation (Steps 1.1–1.4)

### Step 1.1 🔧 — Redesign BottomTabs

**Depends on:** Step 0.1 (design tokens)

**Files to edit:**
- `src/app/layout/BottomTabs.tsx`

**What to do:**
1. Change tab bar height from 64px to 56px. Update `--bottom-nav-height` in CSS.
2. Increase label font from `text-[10px]` to `text-xs` (12px).
3. Add active tab pill indicator: when active, show a pill-shaped background behind the icon (M3 Navigation Bar pattern). Use `bg-[var(--color-primary-light)]` with `rounded-full` padding around the icon.
4. Change active icon to filled variant, inactive to outlined (current SVGs already do this for some — make consistent for all 4).
5. Add `shadow-sm` to the nav container (in addition to current `border-t`).
6. Add behavior: tap on already-active tab → `window.scrollTo({ top: 0, behavior: 'smooth' })`.
7. Ensure each tab touch target is at least 48×48px.
8. Add `aria-label` to the `<nav>` element: `aria-label="Main navigation"`.
9. Add `aria-current="page"` to the active tab button.

**Done when:** Tab bar is 56px, labels are 12px, active tab has pill bg + filled icon, tapping active tab scrolls to top, passes basic a11y audit.

---

### Step 1.2 ⚡ — Update AppShell for Toast mounting

**Depends on:** Step 0.4 (Toast system)

**Files to edit:**
- `src/app/layout/AppShell.tsx`

**What to do:**
Add `<ToastContainer />` as the last child inside `AppShell`, positioned above the `<BottomTabs>`.

**Done when:** Toasts render correctly positioned above the tab bar on all screens.

---

### Step 1.3 🔧 — Add route change a11y announcements

**Depends on:** Step 0.5 (a11y foundation)

**Files to edit:**
- `src/app/App.tsx` or create `src/shared/hooks/useRouteAnnounce.ts`

**What to do:**
1. Create a visually hidden `aria-live="polite"` region in `App.tsx`.
2. On every route change (use `useLocation()` from react-router), update this region with the page name: "Navigated to [Page Title]".
3. Also update `document.title` on every route change: "BROBROGID — [Page Name]".

**Done when:** Screen readers announce page changes. Browser tab title updates on navigation.

---

### Step 1.4 ⚡ — Clean hardcoded Russian strings from components

**Depends on:** Nothing (can be done anytime, but best done early)

**Files to audit:**
- `src/features/explore/pages/ExplorePage.tsx` — "Популярные места", "Природа Осетии", cuisine filter labels
- `src/features/food/pages/FoodPage.tsx` — "Все", "Еда и напитки", "заведений"
- `src/features/search/pages/SearchPage.tsx` — "Все", "результат", "результатов", "Попробуйте изменить запрос"
- `src/features/poi/pages/POIDetailPage.tsx` — "Информация"
- `src/features/tours/pages/ToursPage.tsx` — "Осталось N мест"
- `src/features/ordering/pages/MenuPage.tsx` — "Загрузка...", "Все"

**What to do:**
Find every hardcoded Russian string. Add corresponding keys to `src/i18n/locales/ru.json` and `en.json`. Replace strings with `t('key')` calls.

**Done when:** `grep -r "\"[А-Яа-яЁё]" src/features/ src/shared/` returns zero matches (excluding import paths).

---

## PHASE 2: Explore (Home) Screen (Steps 2.1–2.5)

### Step 2.1 🔧 — Simplify Explore header

**Depends on:** Steps 0.1, 1.1

**Files to edit:**
- `src/features/explore/pages/ExplorePage.tsx`

**What to do:**
1. Remove the emergency button from the header (it's redundant with the quick-access row).
2. Shrink the header: replace the large `text-2xl font-black` BROBROGID title with a compact brand mark (smaller, `text-lg font-bold`). Remove the tagline.
3. Add a language toggle button (RU/EN text, not flags) to the right side of the header.
4. Make the header sticky with transparent bg at top, white + shadow on scroll. Use `IntersectionObserver` or scroll listener.

**Done when:** Header is compact (one line), sticky, no emergency button, has language toggle.

---

### Step 2.2 🔧 — Upgrade SearchBar to tappable hero card

**Depends on:** Step 0.1

**Files to edit:**
- `src/shared/ui/SearchBar.tsx`
- `src/features/explore/pages/ExplorePage.tsx`

**What to do:**
1. On Explore page, SearchBar should be a tappable div (not a real input) that navigates to `/search` on tap.
2. Style: 48px height, `rounded-xl` (12px), `bg-gray-50` with `border`, left magnifier icon, placeholder text "Search places, tours, food...".
3. Make it sticky: pin below the header when scrolling past its natural position.

**Done when:** Tapping search bar on Explore navigates to SearchPage. SearchBar on Explore is not editable (just a link).

---

### Step 2.3 🔧 — Reduce category chips from 8 to 5+More

**Depends on:** Step 0.1

**Files to edit:**
- `src/features/explore/pages/ExplorePage.tsx`
- Create `src/shared/ui/CategoryBottomSheet.tsx`

**What to do:**
1. Show only 5 category chips on Explore: Attractions, Food, Nature, Culture, Activities.
2. Add a 6th "More" chip with a grid/dots icon.
3. Tapping "More" opens a modal bottom sheet showing all 10 categories in a 2-column grid with icons.
4. Add right-edge fade gradient on the chip container to signal scrollability.
5. Update chip design: 36px height, `rounded-full`, 14px font, category icon + label.

**Done when:** 5 chips + "More" visible. "More" opens bottom sheet with all categories. Chips are 36px tall.

---

### Step 2.4 🔨 — Upgrade horizontal card sections

**Depends on:** Steps 0.1, 0.3 (Skeleton), 0.6 (ImageWithFallback)

**Files to edit:**
- `src/shared/ui/POICard.tsx` (horizontal variant)
- `src/shared/ui/SectionHeader.tsx`
- `src/features/explore/pages/ExplorePage.tsx`

**What to do:**
1. **POICard horizontal variant:**
   - Image: 3:2 aspect ratio (not fixed 130px height), `rounded-t-2xl`
   - Replace inline `onError` with `<ImageWithFallback>`
   - Card info: Name (1 line truncate, 14px semibold) + category chip (tiny) + rating + distance
   - Add save (heart) button overlay on image top-right corner
   - Add `scroll-snap-align: start` CSS
   - Card width: `min-w-[200px] max-w-[260px]`

2. **Section containers:**
   - Add `scroll-snap-type: x mandatory` to each horizontal scroll container
   - Show 2–2.5 cards with 40px peek of the next card
   - Add right-edge fade gradient mask

3. **SectionHeader:**
   - Make "See all →" link more prominent (14px, primary color, bold)

4. **Loading state:**
   - While POI data is loading, show `<POICardSkeleton>` × 3 per section

5. **Reduce sections from 5 to max 5 but make order configurable:**
   - Remove "European Food" section from default (it's a sub-filter of Food)
   - Keep: Popular, National Cuisine, Tours, Nature + one conditional slot
   - Add a `getSectionOrder()` utility that returns section order based on time of day (for future context personalization)

**Done when:** Cards have 3:2 images, snap on scroll, show 2.5 cards, skeletons appear while loading, 5 sections max.

---

### Step 2.5 🔧 — Quick-access button visual upgrade

**Depends on:** Step 0.1

**Files to edit:**
- `src/features/explore/pages/ExplorePage.tsx` (QuickAccessButton component)

**What to do:**
1. Each button gets a soft category-colored background tint:
   - Emergency: `bg-red-50`, icon in red
   - Food: `bg-amber-50`, icon in amber
   - Tours: `bg-blue-50`, icon in blue
   - Transport: `bg-green-50`, icon in green
2. Height: 48px. Border-radius: `rounded-2xl` (16px).
3. Icon: 24px. Label: 12px medium.
4. Equal-width flex with 8px gaps.
5. Ensure 48×48px minimum touch target.

**Done when:** 4 buttons with colored backgrounds, consistent sizing, proper touch targets.

---

## PHASE 3: Map Overhaul (Steps 3.1–3.5)

### Step 3.1 🏗️ — Build BottomSheet component

**Depends on:** Step 0.1 (tokens)

**Files to create:**
- `src/shared/ui/BottomSheet.tsx`

**What to do:**
Build a reusable three-state bottom sheet with:
- **Props:** `peekHeight`, `halfHeight`, `fullHeight`, `children`, `onStateChange`, `isOpen`
- **Three snap points:** peek (~120px), half (~50vh), full (~90vh)
- **Drag handle:** 32×4px gray pill at top center
- **Gesture:** touch-drag to expand/collapse. Velocity-based snap (fast swipe → snap to next state, slow drag → snap to nearest state)
- **Non-modal:** NO scrim/overlay. Content behind remains interactive.
- **Spring animation:** 300ms with spring-like easing for snapping
- **State store:** connect to `useUIStore.bottomSheetState`

Use `framer-motion` (already in the project) for drag gesture handling and spring animations.

**Implementation detail:**
```tsx
<BottomSheet
  peek={120}
  half="50vh"
  full="calc(100vh - 80px)"
  onStateChange={(state) => setBottomSheetState(state)}
>
  {/* content changes based on state */}
</BottomSheet>
```

**Done when:** Sheet can be dragged between 3 states with smooth spring animation. No overlay behind it. State syncs to Zustand.

---

### Step 3.2 🏗️ — Build POI preview content for bottom sheet

**Depends on:** Step 3.1

**Files to create:**
- `src/features/map/components/MapPOISheet.tsx`

**What to do:**
Build three content layers that render based on bottom sheet state:

**Peek state (120px):**
- Category icon (24px) + POI name (16px semibold, 1 line) + rating star + score
- Distance from user (if GPS available)
- "Directions" mini CTA button (right-aligned)

**Half state (~50vh):**
- Everything from peek, PLUS:
- Photo strip: 3 thumbnail images (80×80px, rounded-lg, horizontal scroll)
- Open/closed status + today's hours
- Action buttons row: Directions | Call | Save | Share (same as POIDetailPage but compact)
- Description snippet (3 lines max)

**Full state (~90vh):**
- Complete POI detail content (reuse/share components from POIDetailPage)
- At bottom: "Open full page →" link that navigates to `/poi/:id`

**Done when:** Tapping a map marker opens sheet in peek state with POI info. Dragging up reveals more content. Full state shows complete details.

---

### Step 3.3 🔨 — Integrate bottom sheet with MapPage

**Depends on:** Steps 3.1, 3.2

**Files to edit:**
- `src/features/map/pages/MapPage.tsx`

**What to do:**
1. Remove the current popup card that appears on marker tap.
2. Add `<BottomSheet>` with `<MapPOISheet>` as child to the MapPage layout.
3. On marker tap:
   - Set `selectedPOIId` in UI store
   - Open sheet in peek state
   - Fly map camera to center on marker (300ms animation)
   - Scale marker up to 1.3×
4. On sheet dismiss (swipe below peek): deselect marker, reset scale.
5. Map camera padding: when sheet height changes, adjust map padding-bottom so the selected marker stays visible above the sheet.

**Done when:** Tapping marker → peek sheet. Drag up → half/full. Map stays interactive. Camera adjusts.

---

### Step 3.4 🔨 — Add marker clustering

**Depends on:** Nothing (can be done in parallel with 3.1–3.3)

**Files to edit:**
- `src/features/map/pages/MapPage.tsx`

**What to do:**
1. Switch from creating individual `maplibregl.Marker` instances to using a GeoJSON source with clustering enabled:
```ts
map.addSource('pois', {
  type: 'geojson',
  data: poiGeoJSON,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
});
```
2. Add cluster circle layer: size scales with point_count (30/40/50px for small/medium/large clusters).
3. Add count label layer inside clusters.
4. On cluster click: `map.getSource('pois').getClusterExpansionZoom(clusterId)` → zoom to expand.
5. Add individual marker layer for unclustered points with category-specific icons.
6. Category markers: use distinct shapes/icons per category (NOT color-only — accessibility).

**Done when:** Zoomed out shows clusters with counts. Tapping cluster zooms in. Zoomed in shows individual markers with category icons.

---

### Step 3.5 🔧 — Add map control buttons

**Depends on:** Step 3.1 (sheet positioning)

**Files to edit:**
- `src/features/map/pages/MapPage.tsx`

**What to do:**
1. **"Search this area" button:** floating pill at top-center, appears when user pans/zooms beyond current data bounds. On tap: reload POIs for new viewport. Hide after tap.
2. **GPS locate button:** floating circle, bottom-right, above the sheet peek height. Three states:
   - Inactive: gray outline
   - Active: blue fill (tracking position)
   - Heading: blue fill + compass indicator
3. **Zoom +/− buttons:** vertically stacked, right side, above GPS button (needed for WCAG 2.5.7 dragging alternative).
4. All controls must dynamically reposition when bottom sheet height changes (use CSS `bottom` tied to sheet state).

**Done when:** "Search this area" appears on pan, GPS button works, zoom buttons visible, nothing overlaps the sheet.

---

## PHASE 4: Search & Filters (Steps 4.1–4.4)

### Step 4.1 🔨 — Enhance SearchPage with autocomplete

**Depends on:** Steps 0.1, 0.3

**Files to edit:**
- `src/features/search/pages/SearchPage.tsx`

**What to do:**
1. **On focus (empty input):** show overlay with:
   - "Recent searches" section (read from localStorage, max 5 items, each with X to remove)
   - Category shortcuts (grid of 6 category icons+labels)
2. **On typing (debounce 300ms):** show autocomplete suggestions below input. Bold the matching portion of each suggestion. Show category icon next to each suggestion.
3. **On submit / suggestion tap:** save query to recent searches in localStorage. Show results.
4. **Empty state (no results):** use `<EmptyState>` with magnifier icon, "Nothing found" headline, "Try different keywords" body, "Browse Categories" CTA button.
5. **Result count:** show above results list: "42 results" (localized).

**Done when:** Recent searches persist across sessions. Autocomplete shows while typing. Empty state has illustration and CTA.

---

### Step 4.2 🔨 — Build advanced filter bottom sheet

**Depends on:** Step 3.1 (BottomSheet component — reuse it)

**Files to create:**
- `src/features/search/components/FilterSheet.tsx`

**Files to edit:**
- `src/features/search/pages/SearchPage.tsx`

**What to do:**
1. Add a "Filters" chip (with funnel icon) at the end of the category chip row.
2. When active filters exist, show count badge on the "Filters" chip.
3. Tapping "Filters" opens a modal bottom sheet (this one IS modal — with scrim).
4. Filter controls inside:
   - **Distance:** slider 0.5km–50km (requires user GPS)
   - **Price level:** ₽ / ₽₽ / ₽₽₽ / ₽₽₽₽ multi-select toggle buttons
   - **Rating:** minimum star slider 1–5
   - **Cuisine type:** multi-select chips (only shown when food category active)
   - **Open Now:** toggle switch
5. Sticky bottom inside sheet: "Show N results" primary button (count updates live as filters change) + "Reset" text button.

**Done when:** Filters open in sheet, sliders and toggles work, result count updates live, "Reset" clears all, "Show N results" closes sheet and applies filters.

---

### Step 4.3 🔧 — Add list↔map toggle on search results

**Depends on:** Steps 3.1, 3.4

**Files to edit:**
- `src/features/search/pages/SearchPage.tsx`

**What to do:**
1. Add a floating "Map" button (FAB style, bottom-right, above tab bar) on the search results list view.
2. Tapping it switches to a map view showing results as markers.
3. In map mode: show a horizontal card strip at the bottom (swipeable). Swiping cards highlights the corresponding marker on map (and vice versa).
4. Add a "List" button in map mode to switch back.

**Done when:** Toggle between list and map view of search results. Map highlights match card selection.

---

### Step 4.4 🔧 — Add sort control to search results

**Depends on:** Step 4.1

**Files to edit:**
- `src/features/search/pages/SearchPage.tsx`

**What to do:**
1. Add sort dropdown/chip row below the filter chips: "Relevance" (default) / "Distance" / "Rating" / "Popularity".
2. Implement sort logic for each option.
3. "Distance" sort requires user GPS — if unavailable, show toast explaining GPS is needed.

**Done when:** Results re-sort on selection. Default is relevance.

---

## PHASE 5: POI Detail Page (Steps 5.1–5.5)

### Step 5.1 🔨 — Upgrade photo carousel

**Depends on:** Step 0.6 (ImageWithFallback)

**Files to edit:**
- `src/features/poi/pages/POIDetailPage.tsx`

**What to do:**
1. Replace current photo section with a proper carousel:
   - Full-bleed width (no side gaps)
   - Fixed height: 280px (phone) / 360px (tablet)
   - CSS `scroll-snap-type: x mandatory` + `scroll-snap-align: start`
   - Show 15% peek of next image to signal scrollability
2. Add "1 / N" counter overlay at bottom-right (white text on dark scrim gradient).
3. Replace inline `onError` with `<ImageWithFallback>`.
4. On image tap: open full-screen gallery modal (black bg, pinch-zoom, swipe between images, X close button).
5. Skeleton while loading: show `<Skeleton variant="rect" height={280}>`.

**Done when:** Carousel snaps, shows counter, opens full-screen on tap, uses ImageWithFallback.

---

### Step 5.2 🔧 — Reorganize info hierarchy

**Depends on:** Step 5.1

**Files to edit:**
- `src/features/poi/pages/POIDetailPage.tsx`

**What to do:**
1. Move rating row directly under the name (before status/price info). Show: ★ 4.7 (128 reviews) — make review count tappable (scrolls to reviews section).
2. Create a "quick facts" card (gray-50 bg, rounded-xl, 12px padding) containing:
   - 📍 Address
   - 🕐 Today's hours (highlighted green/red for open/closed)
   - 📞 Phone (tappable `tel:` link)
3. Move this card ABOVE the description (before, hours/address/phone were at the bottom).
4. Reorder action buttons: Directions → Call → Save → Share → Menu (if applicable). Use consistent 44px height.

**Done when:** Info hierarchy matches spec: photos → name+rating → actions → quick facts → description → reviews.

---

### Step 5.3 🔧 — Smart sticky CTA bar

**Depends on:** Step 5.2

**Files to edit:**
- `src/features/poi/pages/POIDetailPage.tsx`

**What to do:**
1. CTA bar should be HIDDEN when inline action buttons are visible in viewport.
2. CTA bar slides up from bottom (200ms ease-out) when user scrolls past the inline action buttons.
3. CTA text is context-aware:
   - Restaurant with menu: "Order Delivery" (primary) + "Reserve" (secondary outline)
   - Attraction: "Add to Trip" (primary) + "Get Directions" (secondary)
   - Tour: "Book for ₽N,NNN" (show price in button)
4. Use `IntersectionObserver` on the inline action buttons row to toggle CTA bar visibility.

**Done when:** CTA bar appears/disappears based on scroll position. Button text matches POI type.

---

### Step 5.4 🔧 — Add features/tags chips

**Depends on:** Step 0.1

**Files to edit:**
- `src/features/poi/pages/POIDetailPage.tsx`
- `src/data/types/index.ts` (add `features?: string[]` to POI type if not present)

**What to do:**
1. Add a horizontal chip strip below the description showing POI features: "WiFi", "Parking", "Outdoor Seating", "Credit Cards", "Wheelchair Access", etc.
2. Chips: small, `rounded-full`, gray-100 bg, 12px text with small icon.
3. Only show if POI has features data (graceful absence).

**Done when:** Feature chips show when data exists, hidden when not.

---

### Step 5.5 🔧 — Upgrade reviews section

**Depends on:** Step 0.1

**Files to edit:**
- `src/features/poi/pages/POIDetailPage.tsx`

**What to do:**
1. Add aggregate score card at top of reviews: large number (4.7) + star visualization + total review count.
2. Add rating distribution bar chart (5 bars, one per star level, showing percentage fill).
3. Review cards: add user avatar placeholder (circle, initials), improve typography.
4. Add "See all N reviews →" link at bottom (navigates to full reviews list — or just expands inline for now).
5. Skeleton while reviews load: 3 review card placeholders.

**Done when:** Reviews section has aggregate card, distribution bars, improved review cards, loading skeleton.

---

## PHASE 6: Tours & Food (Steps 6.1–6.5)

### Step 6.1 🔧 — Redesign tour cards

**Depends on:** Step 0.6 (ImageWithFallback)

**Files to edit:**
- `src/features/tours/pages/ToursPage.tsx`

**What to do:**
1. Hero image: 2:1 aspect ratio (currently ~2.2:1 at 180px height — adjust to ratio-based).
2. Add bottom gradient overlay on image (for price/status badges readability).
3. Price badge: move from absolute bottom-left to a more prominent position inside the gradient.
4. Status badge: keep top-right.
5. Add spots counter: "Only 3 spots left!" (only if < 4 remaining) in green accent text.
6. Use `<ImageWithFallback>` for tour photos.
7. Add sort control: "Date" (default) / "Price" / "Rating".

**Done when:** Tour cards have gradient overlay, spots counter, sorting works.

---

### Step 6.2 🔨 — Build tour itinerary timeline

**Depends on:** Step 0.1

**Files to edit:**
- `src/features/tours/pages/TourDetailPage.tsx`
- Create `src/features/tours/components/ItineraryTimeline.tsx`

**What to do:**
Build a vertical timeline component:
1. Left side: vertical line connecting numbered circles (1, 2, 3...).
2. Each stop: circle marker → stop name (bold) + duration text + optional thumbnail photo.
3. Tappable stops: if linked to a POI, tap navigates to `/poi/:id`.
4. Between stops: show estimated travel time (walking/driving icon + duration).

**Done when:** Tour detail shows a visual step-by-step itinerary with connected stops.

---

### Step 6.3 🔧 — Food page upgrades

**Depends on:** Steps 0.1, 0.6

**Files to edit:**
- `src/features/food/pages/FoodPage.tsx`

**What to do:**
1. Add "Open Now" toggle switch at top of page (prominent, not just a chip).
2. Add distance indicator on each restaurant card (requires user GPS from `useGeolocation`).
3. Add sort control: Distance / Rating / Price.
4. Card variant: show cuisine type badge, price level (₽/₽₽/₽₽₽), distance.
5. Use `<ImageWithFallback>` for restaurant photos.

**Done when:** Open Now toggle filters correctly, cards show distance and price level, sort works.

---

### Step 6.4 🔧 — Menu page sticky category tabs

**Depends on:** Step 0.1

**Files to edit:**
- `src/features/ordering/pages/MenuPage.tsx`

**What to do:**
1. Replace current category chips with a sticky horizontal tab bar with underline indicator.
2. Tapping a tab scrolls content to that category section.
3. Scrolling content auto-updates the active tab (scroll-spy behavior).
4. Use `IntersectionObserver` for scroll-spy.

**Done when:** Category tabs are sticky, have underline indicator, scroll-spy syncs tabs with content position.

---

### Step 6.5 🔧 — Cart quantity stepper

**Depends on:** Step 0.1

**Files to edit:**
- `src/features/ordering/pages/MenuPage.tsx`
- `src/features/ordering/pages/CartPage.tsx`

**What to do:**
1. Replace simple "Add" button with a quantity stepper that appears after first tap:
   - First tap: button changes from "+ Add" to "−  1  +"
   - Subsequent taps: increment/decrement count
   - When count reaches 0: revert to "+ Add" button
2. Floating cart badge: fixed bottom-right (above tab bar), shows item count circle + total price. Tap → navigate to `/cart`.
3. CartPage: add swipe-to-delete on cart items (with undo toast).

**Done when:** Menu items have quantity steppers, floating cart badge shows, cart supports swipe-delete with undo.

---

## PHASE 7: Saved & Empty States (Steps 7.1–7.3)

### Step 7.1 🔨 — Redesign Saved page with collections

**Depends on:** Steps 0.1, 0.4 (Toast for undo)

**Files to edit:**
- `src/features/saved/pages/SavedPage.tsx`
- `src/data/stores/data-store.ts` (add collections model)
- Create `src/features/saved/pages/CollectionDetailPage.tsx`
- `src/app/router.tsx` (add `/saved/:collectionId` route)

**What to do:**
1. Add `collections` to data store:
```ts
interface Collection {
  id: string;
  name: string;
  poiIds: string[];
  createdAt: number;
}
```
2. Default collection: "All Saved" (backward compatible with current favorites).
3. SavedPage shows collection cards in a 2-column grid: cover image (first POI's photo) + name + count.
4. Add "+ New Collection" card at the end of the grid.
5. Create CollectionDetailPage: list of saved POIs, "Show on Map" button, swipe-to-remove (with undo toast).
6. Empty state for Saved page: heart illustration + "Save places you want to visit" + "Explore" CTA.

**Done when:** Collections model works, default collection shows all saved POIs, new collections can be created, empty state renders correctly.

---

### Step 7.2 🔧 — Implement all empty states

**Depends on:** Step 0.3 (Skeleton — for distinguishing loading vs empty)

**Files to edit:**
- `src/shared/ui/EmptyState.tsx` (already exists — upgrade)
- Every page that can have zero content

**What to do:**
Upgrade `<EmptyState>` component to support:
- Illustration/icon (centered, 120px)
- Headline (18px semibold)
- Body text (14px, secondary color)
- CTA button (primary, optional)

Then implement in each screen:

| Screen | Icon | Headline | CTA |
|--------|------|----------|-----|
| Saved (empty) | 🤍 | No saved places yet | Explore Places |
| Search (no results) | 🔍 | Nothing found | Browse Categories |
| Cart (empty) | 🛍️ | Your cart is empty | Find Food |
| Tours (none) | 📅 | No tours right now | Explore Map |
| Food (none) | 🍽️ | No restaurants match | Clear Filters |

Tone: helpful, never blaming. "No saved places yet" NOT "You haven't saved anything".

**Done when:** Every screen that can be empty shows a designed empty state with illustration and CTA.

---

### Step 7.3 🔧 — Build offline indicator banner

**Depends on:** Steps 0.4 (Toast), 0.1

**Files to create:**
- `src/shared/ui/OfflineBanner.tsx`
- `src/shared/hooks/useOnlineStatus.ts`

**Files to edit:**
- `src/app/layout/AppShell.tsx`

**What to do:**
1. Create `useOnlineStatus()` hook using `navigator.onLine` + `online`/`offline` event listeners.
2. Build `<OfflineBanner>`: slim bar at top of screen, yellow/amber bg, "You're offline. Some features may be limited." + dismiss X button.
3. Mount in `AppShell` conditionally when offline.
4. When going back online: show toast "You're back online".

**Done when:** Going offline shows banner. Coming back online shows toast. Banner is dismissible.

---

## PHASE 8: Polish & Micro-Interactions (Steps 8.1–8.5)

### Step 8.1 🔧 — Heart save animation

**Depends on:** Step 0.1

**Files to edit:**
- `src/shared/ui/FavoriteButton.tsx`

**What to do:**
1. On save toggle: icon scales 1.0 → 1.3 → 1.0 with fill color transition, 300ms total.
2. Use `framer-motion` for the spring animation.
3. Add `navigator.vibrate(10)` on save (light haptic, only on supported devices).
4. Show toast: "Saved!" (on add) / "Removed" with undo action (on remove).

**Done when:** Heart bounces and fills on save, vibrates on supported devices, shows toast with undo on unsave.

---

### Step 8.2 🔧 — Button and card tap feedback

**Depends on:** Step 0.1

**Files to edit:**
- `src/index.css` (add global tap styles)

**What to do:**
1. Add to `index.css`:
```css
button:active, [role="button"]:active {
  transform: scale(0.97);
  opacity: 0.9;
  transition: transform var(--duration-micro) ease-out;
}
```
2. For POI cards specifically: `scale(0.98)` + shadow reduce on `:active`.
3. Ensure this doesn't apply to nav tabs or toggle buttons (use a `.pressable` class for opt-in if needed).

**Done when:** Buttons and cards have subtle press feedback. Navigation tabs don't squish.

---

### Step 8.3 🔧 — Progressive image loading

**Depends on:** Step 0.6 (ImageWithFallback)

**Files to edit:**
- `src/shared/ui/ImageWithFallback.tsx`

**What to do:**
Upgrade the component to support a three-stage load:
1. **Stage 1:** Show `<Skeleton variant="rect">` (shimmer animation)
2. **Stage 2 (optional, if dominant color data is available):** Fill with solid dominant color
3. **Stage 3:** Image loads → apply with `blur(10px)` initially → transition to `blur(0)` over 200ms

Use CSS transition on `filter` property.

**Done when:** Images fade in smoothly from blur to clarity. No content layout shift during load.

---

### Step 8.4 🔧 — Pull-to-refresh on Explore

**Depends on:** Step 0.1

**Files to create:**
- `src/shared/ui/PullToRefresh.tsx`

**Files to edit:**
- `src/features/explore/pages/ExplorePage.tsx`

**What to do:**
1. Build a `<PullToRefresh onRefresh={() => Promise}>` wrapper component.
2. Track touch-start Y, touch-move delta. Show a spinner that follows finger position.
3. At 80px threshold: trigger refresh, show spinner animation.
4. On refresh complete: spring-back the content to original position.
5. Respect `prefers-reduced-motion`: disable tracking animation if set.

**Done when:** Pulling down on Explore page shows spinner and refreshes data.

---

### Step 8.5 🔧 — Page transition animations

**Depends on:** Step 0.1

**Files to edit:**
- `src/app/App.tsx` or `src/app/layout/AppShell.tsx`

**What to do:**
1. Wrap the route `<Outlet>` with `framer-motion` `AnimatePresence`.
2. Tab switches: horizontal shared-axis slide (left/right based on tab index) + opacity fade, 300ms.
3. Push navigation (to detail pages): slide in from right, 300ms.
4. Back navigation: slide out to right, 300ms.
5. Respect `prefers-reduced-motion`: replace with instant opacity change.

**Done when:** Page transitions are smooth and directional. Back navigation slides the opposite direction. Reduced motion users see instant changes.

---

## PHASE 9: Remaining a11y & i18n (Steps 9.1–9.3)

### Step 9.1 🔧 — Semantic HTML audit

**Depends on:** All previous phases

**Files to audit:** Every page component

**What to do:**
Go through each page and ensure:
1. `<nav>` for BottomTabs and any breadcrumbs
2. `<main>` for primary content area (one per page)
3. `<header>` for sticky page headers
4. Heading hierarchy: H1 for page title, H2 for sections, H3 for sub-sections, never skip
5. All `<img>`: meaningful `alt` for content images, `alt=""` for decorative
6. All icon buttons: `aria-label` describing action
7. Map container: `aria-label="Interactive map of North Ossetia showing points of interest"`

**Done when:** Lighthouse Accessibility score ≥ 95. No heading hierarchy violations.

---

### Step 9.2 🔧 — Map accessibility

**Depends on:** Steps 3.1–3.5

**Files to edit:**
- `src/features/map/pages/MapPage.tsx`

**What to do:**
1. Wrap map in `<figure>` with `<figcaption>`.
2. Add `aria-label` on map container div.
3. Add "View as list" button that shows all visible POIs in a sorted list below/instead of the map.
4. Make map zoom buttons keyboard-accessible (already are if proper `<button>` elements).
5. When a marker is selected via keyboard (Tab + Enter), announce POI name via `aria-live` region.

**Done when:** Map has figure/figcaption wrapper, aria-label, list alternative, keyboard navigation announces selections.

---

### Step 9.3 🔧 — i18n string completeness pass

**Depends on:** Step 1.4 (hardcoded string cleanup)

**Files to edit:**
- `src/i18n/locales/ru.json`
- `src/i18n/locales/en.json`

**What to do:**
1. Run a final audit: `grep -rn "\"[A-Za-z ]{4,}\"" src/features/ --include="*.tsx" | grep -v import | grep -v className | grep -v console` to find any remaining hardcoded English strings.
2. Do the same for Russian: `grep -rn "'[А-Яа-яЁё]" src/features/ --include="*.tsx"`.
3. Verify all keys exist in both locale files.
4. Test the app fully in English mode — every label, button, placeholder, error message should be in English.
5. Check that buttons and tabs don't overflow with Russian strings.

**Done when:** Zero hardcoded strings in components. App is fully functional in both RU and EN. No layout overflow in Russian.

---

## PHASE 10: Onboarding & Final (Steps 10.1–10.3)

### Step 10.1 🔨 — Build onboarding flow

**Depends on:** Steps 0.1, 0.3

**Files to create:**
- `src/features/onboarding/pages/OnboardingPage.tsx`
- `src/features/onboarding/components/WelcomeStep.tsx`
- `src/features/onboarding/components/InterestsStep.tsx`
- `src/features/onboarding/components/LocationStep.tsx`

**Files to edit:**
- `src/app/router.tsx` (add `/onboarding` route)
- `src/app/App.tsx` (check if onboarding completed, redirect if not)

**What to do:**
1. **Screen 1 — Welcome:** App logo + tagline + hero image of Ossetian landscape. "Get Started" button. Language selector (RU/EN) at bottom.
2. **Screen 2 — Interests:** "What interests you?" + 5–6 category bubbles with icons (multi-select). "Continue" + "Skip" at top-right.
3. **Screen 3 — Location:** "Find experiences near you" + map illustration. "Enable Location" (triggers `navigator.geolocation` permission) + "Not Now" text link.
4. Progress dots (1/3, 2/3, 3/3) at bottom.
5. On completion: store `onboardingCompleted: true` + selected interests in localStorage. Redirect to Explore.
6. On subsequent launches: skip straight to Explore.

**Done when:** First launch shows onboarding. Interests are stored. Location permission is requested with explanation. Subsequent launches skip onboarding.

---

### Step 10.2 🔧 — Performance audit & optimization

**Depends on:** All previous phases

**What to do:**
1. Run Lighthouse on every major page. Target: Performance > 90, Accessibility > 95.
2. Check initial bundle size: `npx vite-bundle-visualizer`. Target: < 150KB gzipped for initial load.
3. Verify all lazy-loaded routes actually code-split (check `dist/assets/` for separate chunks).
4. Ensure all images use WebP format where possible.
5. Verify service worker caching strategy (Workbox config in `vite.config.ts`).
6. Test on throttled 3G connection: FCP < 3s, LCP < 4s.
7. Check for layout shifts (CLS < 0.1) — usually caused by images without explicit dimensions.

**Done when:** Lighthouse scores meet targets. No major bundle bloat. Images are optimized.

---

### Step 10.3 ⚡ — Final QA checklist

**Depends on:** Everything

**Run through this checklist on a real phone (both iOS Safari and Chrome Android):**

- [ ] Tab bar: 4 tabs work, active state visible, tap active scrolls to top
- [ ] Explore: 5 sections load with skeletons, cards snap-scroll, "More" chips opens sheet
- [ ] Search: autocomplete works, recent searches persist, filters apply, empty state shows
- [ ] Map: markers cluster, tap shows bottom sheet, drag between 3 states, "Search this area" appears
- [ ] POI detail: carousel works, 1/N counter visible, CTA bar appears on scroll, reviews load
- [ ] Tours: filter works, tour detail shows itinerary, booking CTA works
- [ ] Food: Open Now toggle filters, distance shows, sort works
- [ ] Menu: sticky category tabs scroll-spy works, quantity stepper works, cart badge shows
- [ ] Saved: collections work, empty state shows, swipe-to-remove has undo
- [ ] Offline: banner appears when offline, cached content accessible, banner dismissible
- [ ] i18n: switch to EN → everything translates, no overflow, switch back to RU → correct
- [ ] A11y: keyboard tab through works, focus rings visible, screen reader announces pages
- [ ] Animations: all transitions smooth, no jank, reduced-motion mode disables them
- [ ] Back button: works correctly on every page, never gets stuck

**Done when:** All boxes checked. Ship it. 🚀

---

## Summary: Total Steps & Effort

| Phase | Steps | Estimated Effort |
|-------|-------|-----------------|
| 0: Foundation | 6 | ~6 hours |
| 1: Navigation Shell | 4 | ~4 hours |
| 2: Explore Screen | 5 | ~10 hours |
| 3: Map Overhaul | 5 | ~20 hours |
| 4: Search & Filters | 4 | ~12 hours |
| 5: POI Detail | 5 | ~10 hours |
| 6: Tours & Food | 5 | ~12 hours |
| 7: Saved & Empty States | 3 | ~10 hours |
| 8: Polish & Micro-interactions | 5 | ~8 hours |
| 9: a11y & i18n | 3 | ~6 hours |
| 10: Onboarding & Final | 3 | ~8 hours |
| **TOTAL** | **48 steps** | **~106 hours** |
