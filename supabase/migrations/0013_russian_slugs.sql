-- BROBROGID — Sprint 6: Russian transliterated slugs for POIs
--
-- Migrates 101 POIs from English slugs to Russian transliteration of name.ru.
-- Preserves original slug in slug_legacy for 301 redirects.
--
-- Rollback: UPDATE pois SET slug = slug_legacy WHERE slug_legacy != slug;
--           ALTER TABLE pois DROP COLUMN slug_legacy;
--
-- Generated from supabase/scripts/slug_migration_dry_run.ts
-- Dry run: .agent/sprint6_dry_run.txt
-- Applied: 2026-04-07

-- Add legacy slug column
ALTER TABLE public.pois ADD COLUMN IF NOT EXISTS slug_legacy TEXT;

-- Backfill legacy = current slug (only if NULL to make idempotent)
UPDATE public.pois SET slug_legacy = slug WHERE slug_legacy IS NULL;

-- ============================================================================
-- 101 UPDATE statements generated from name.ru transliteration
-- ============================================================================

-- poi-001: "Мидаграбинские водопады"
UPDATE public.pois SET slug = 'midagrabinskie-vodopady' WHERE id = 'poi-001';
-- poi-002: "Цейское ущелье"
UPDATE public.pois SET slug = 'tseyskoe-uschele' WHERE id = 'poi-002';
-- poi-003: "Цейский ледник"
UPDATE public.pois SET slug = 'tseyskiy-lednik' WHERE id = 'poi-003';
-- poi-004: "Сказский ледник"
UPDATE public.pois SET slug = 'skazskiy-lednik' WHERE id = 'poi-004';
-- poi-005: "Кармадонское ущелье"
UPDATE public.pois SET slug = 'karmadonskoe-uschele' WHERE id = 'poi-005';
-- poi-006: "Водопад Галдоридон (Жемчужный)"
UPDATE public.pois SET slug = 'vodopad-galdoridon-zhemchuzhnyy' WHERE id = 'poi-006';
-- poi-007: "Столовая гора (Мят-Лоам)"
UPDATE public.pois SET slug = 'stolovaya-gora-myat-loam' WHERE id = 'poi-007';
-- poi-008: "Национальный парк «Алания»"
UPDATE public.pois SET slug = 'natsionalnyy-park-alaniya' WHERE id = 'poi-008';
-- poi-009: "Зарамагское водохранилище"
UPDATE public.pois SET slug = 'zaramagskoe-vodohranilische' WHERE id = 'poi-009';
-- poi-010: "Куртатинское ущелье"
UPDATE public.pois SET slug = 'kurtatinskoe-uschele' WHERE id = 'poi-010';
-- poi-011: "Даргавс — «Город мёртвых»"
UPDATE public.pois SET slug = 'dargavs-gorod-myortvyh' WHERE id = 'poi-011';
-- poi-012: "Дзивгисская скальная крепость"
UPDATE public.pois SET slug = 'dzivgisskaya-skalnaya-krepost' WHERE id = 'poi-012';
-- poi-013: "Башенный комплекс Цимити"
UPDATE public.pois SET slug = 'bashennyy-kompleks-tsimiti' WHERE id = 'poi-013';
-- poi-014: "Нузальская часовня"
UPDATE public.pois SET slug = 'nuzalskaya-chasovnya' WHERE id = 'poi-014';
-- poi-015: "Галиат"
UPDATE public.pois SET slug = 'galiat' WHERE id = 'poi-015';
-- poi-016: "Тропа чудес в Кадаргаване"
UPDATE public.pois SET slug = 'tropa-chudes-v-kadargavane' WHERE id = 'poi-016';
-- poi-017: "Памятник Уастырджи"
UPDATE public.pois SET slug = 'pamyatnik-uastyrdzhi' WHERE id = 'poi-017';
-- poi-018: "«Город ангелов» (мемориал Беслана)"
UPDATE public.pois SET slug = 'gorod-angelov-memorial-beslana' WHERE id = 'poi-018';
-- poi-019: "Памятник Сергею Бодрову"
UPDATE public.pois SET slug = 'pamyatnik-sergeyu-bodrovu' WHERE id = 'poi-019';
-- poi-020: "Фонтан «Нарт Сослан»"
UPDATE public.pois SET slug = 'fontan-nart-soslan' WHERE id = 'poi-020';
-- poi-021: "Святилище Реком"
UPDATE public.pois SET slug = 'svyatilische-rekom' WHERE id = 'poi-021';
-- poi-022: "Аланский Свято-Успенский монастырь"
UPDATE public.pois SET slug = 'alanskiy-svyato-uspenskiy-monastyr' WHERE id = 'poi-022';
-- poi-023: "Суннитская мечеть Мухтарова"
UPDATE public.pois SET slug = 'sunnitskaya-mechet-muhtarova' WHERE id = 'poi-023';
-- poi-024: "Церковь Св. Григория Просветителя"
UPDATE public.pois SET slug = 'tserkov-sv-grigoriya-prosvetitelya' WHERE id = 'poi-024';
-- poi-025: "Свято-Георгиевский собор"
UPDATE public.pois SET slug = 'svyato-georgievskiy-sobor' WHERE id = 'poi-025';
-- poi-026: "Роща Хетага"
UPDATE public.pois SET slug = 'roscha-hetaga' WHERE id = 'poi-026';
-- poi-027: "Проспект Мира"
UPDATE public.pois SET slug = 'prospekt-mira' WHERE id = 'poi-027';
-- poi-028: "Набережная реки Терек"
UPDATE public.pois SET slug = 'naberezhnaya-reki-terek' WHERE id = 'poi-028';
-- poi-029: "Парк им. Коста Хетагурова"
UPDATE public.pois SET slug = 'park-im-kosta-hetagurova' WHERE id = 'poi-029';
-- poi-030: "Национальный музей РСО-Алания"
UPDATE public.pois SET slug = 'natsionalnyy-muzey-rso-alaniya' WHERE id = 'poi-030';
-- poi-031: "Художественный музей им. Туганова"
UPDATE public.pois SET slug = 'hudozhestvennyy-muzey-im-tuganova' WHERE id = 'poi-031';
-- poi-032: "Русский театр им. Вахтангова"
UPDATE public.pois SET slug = 'russkiy-teatr-im-vahtangova' WHERE id = 'poi-032';
-- poi-040: "Кадаргаванский каньон"
UPDATE public.pois SET slug = 'kadargavanskiy-kanon' WHERE id = 'poi-040';
-- poi-041: "Дзивгисская наскальная крепость"
UPDATE public.pois SET slug = 'dzivgisskaya-naskalnaya-krepost' WHERE id = 'poi-041';
-- poi-042: "Термальные источники Бирагзанг"
UPDATE public.pois SET slug = 'termalnye-istochniki-biragzang' WHERE id = 'poi-042';
-- poi-045: "Аланский Успенский монастырь (Хидикус)"
UPDATE public.pois SET slug = 'alanskiy-uspenskiy-monastyr-hidikus' WHERE id = 'poi-045';
-- poi-047: "Дигорское ущелье"
UPDATE public.pois SET slug = 'digorskoe-uschele' WHERE id = 'poi-047';
-- poi-048: "Водопады Три сестры (Таймази)"
UPDATE public.pois SET slug = 'vodopady-tri-sestry-taymazi' WHERE id = 'poi-048';
-- poi-049: "Лисри"
UPDATE public.pois SET slug = 'lisri' WHERE id = 'poi-049';
-- poi-051: "Верхний Фиагдон"
UPDATE public.pois SET slug = 'verhniy-fiagdon' WHERE id = 'poi-051';
-- poi-053: "Цамад"
UPDATE public.pois SET slug = 'tsamad' WHERE id = 'poi-053';
-- poi-054: "Музей «Задалески Нана»"
UPDATE public.pois SET slug = 'muzey-zadaleski-nana' WHERE id = 'poi-054';
-- poi-055: "Касарское ущелье"
UPDATE public.pois SET slug = 'kasarskoe-uschele' WHERE id = 'poi-055';
-- poi-056: "Лавочка любви (Архонский перевал)"
UPDATE public.pois SET slug = 'lavochka-lyubvi-arhonskiy-pereval' WHERE id = 'poi-056';
-- poi-059: "Кармадонские термальные ванны"
UPDATE public.pois SET slug = 'karmadonskie-termalnye-vanny' WHERE id = 'poi-059';
-- poi-071: "Фыдджынтæ"
UPDATE public.pois SET slug = 'fyddzhyntae' WHERE id = 'poi-071';
-- poi-072: "Man&Гал"
UPDATE public.pois SET slug = 'man-gal' WHERE id = 'poi-072';
-- poi-073: "Старый мостъ"
UPDATE public.pois SET slug = 'staryy-most' WHERE id = 'poi-073';
-- poi-074: "Модерн Шеф"
UPDATE public.pois SET slug = 'modern-shef' WHERE id = 'poi-074';
-- poi-076: "Куырой"
UPDATE public.pois SET slug = 'kuyroy' WHERE id = 'poi-076';
-- poi-078: "Lookoom Чайхана"
UPDATE public.pois SET slug = 'lookoom-chayhana' WHERE id = 'poi-078';
-- poi-080: "Жар-птица"
UPDATE public.pois SET slug = 'zhar-ptitsa' WHERE id = 'poi-080';
-- poi-081: "Осетинская пивоварня"
UPDATE public.pois SET slug = 'osetinskaya-pivovarnya' WHERE id = 'poi-081';
-- poi-082: "Лимончелло"
UPDATE public.pois SET slug = 'limonchello' WHERE id = 'poi-082';
-- poi-085: "Бавария"
UPDATE public.pois SET slug = 'bavariya' WHERE id = 'poi-085';
-- poi-087: "Жемчужина"
UPDATE public.pois SET slug = 'zhemchuzhina' WHERE id = 'poi-087';
-- poi-088: "Три пирога"
UPDATE public.pois SET slug = 'tri-piroga' WHERE id = 'poi-088';
-- poi-089: "Шаурмания"
UPDATE public.pois SET slug = 'shaurmaniya' WHERE id = 'poi-089';
-- poi-094: "Вертел (Grill House)"
UPDATE public.pois SET slug = 'vertel-grill-house' WHERE id = 'poi-094';
-- poi-095: "Правый берег"
UPDATE public.pois SET slug = 'pravyy-bereg' WHERE id = 'poi-095';
-- poi-097: "ROOTS (ресторан при отеле)"
UPDATE public.pois SET slug = 'roots-restoran-pri-otele' WHERE id = 'poi-097';
-- poi-099: "Роза ветров"
UPDATE public.pois SET slug = 'roza-vetrov' WHERE id = 'poi-099';
-- poi-100: "Отель «Империал»"
UPDATE public.pois SET slug = 'otel-imperial' WHERE id = 'poi-100';
-- poi-101: "Гостиница «Владикавказ»"
UPDATE public.pois SET slug = 'gostinitsa-vladikavkaz' WHERE id = 'poi-101';
-- poi-102: "Гранд-отель «Александровский»"
UPDATE public.pois SET slug = 'grand-otel-aleksandrovskiy' WHERE id = 'poi-102';
-- poi-103: "Интурист-Осетия"
UPDATE public.pois SET slug = 'inturist-osetiya' WHERE id = 'poi-103';
-- poi-104: "Гостиница «Планета Люкс» (бывш. «Кавказ»)"
UPDATE public.pois SET slug = 'gostinitsa-planeta-lyuks-byvsh-kavkaz' WHERE id = 'poi-104';
-- poi-105: "Отель «Амран»"
UPDATE public.pois SET slug = 'otel-amran' WHERE id = 'poi-105';
-- poi-106: "Хостел HohlÆnd"
UPDATE public.pois SET slug = 'hostel-hohlaend' WHERE id = 'poi-106';
-- poi-107: "Гостевой дом «1950» в Цее"
UPDATE public.pois SET slug = 'gostevoy-dom-1950-v-tsee' WHERE id = 'poi-107';
-- poi-108: "Гостевой дом «Горный Родник» в Фиагдоне"
UPDATE public.pois SET slug = 'gostevoy-dom-gornyy-rodnik-v-fiagdone' WHERE id = 'poi-108';
-- poi-110: "Эко-парк «Ирбис» в Даргавсе"
UPDATE public.pois SET slug = 'eko-park-irbis-v-dargavse' WHERE id = 'poi-110';
-- poi-112: "Паломническая гостиница Аланского монастыря"
UPDATE public.pois SET slug = 'palomnicheskaya-gostinitsa-alanskogo-monastyrya' WHERE id = 'poi-112';
-- poi-113: "Центральный рынок"
UPDATE public.pois SET slug = 'tsentralnyy-rynok' WHERE id = 'poi-113';
-- poi-114: "Зелёный рынок"
UPDATE public.pois SET slug = 'zelyonyy-rynok' WHERE id = 'poi-114';
-- poi-115: "ТРЦ «Столица»"
UPDATE public.pois SET slug = 'trts-stolitsa' WHERE id = 'poi-115';
-- poi-116: "Алания Молл"
UPDATE public.pois SET slug = 'alaniya-moll' WHERE id = 'poi-116';
-- poi-117: "Сувенирная лавка «Алания»"
UPDATE public.pois SET slug = 'suvenirnaya-lavka-alaniya' WHERE id = 'poi-117';
-- poi-118: "Магазин осетинских сыров"
UPDATE public.pois SET slug = 'magazin-osetinskih-syrov' WHERE id = 'poi-118';
-- poi-119: "Магазин горного мёда"
UPDATE public.pois SET slug = 'magazin-gornogo-myoda' WHERE id = 'poi-119';
-- poi-120: "Рынок «Привоз»"
UPDATE public.pois SET slug = 'rynok-privoz' WHERE id = 'poi-120';
-- poi-121: "Coco Jumbo караоке-бар"
UPDATE public.pois SET slug = 'coco-jumbo-karaoke-bar' WHERE id = 'poi-121';
-- poi-122: "Эскобар"
UPDATE public.pois SET slug = 'eskobar' WHERE id = 'poi-122';
-- poi-123: "Green Rose караоке-клуб"
UPDATE public.pois SET slug = 'green-rose-karaoke-klub' WHERE id = 'poi-123';
-- poi-124: "«Гитара» караоке-кофейня"
UPDATE public.pois SET slug = 'gitara-karaoke-kofeynya' WHERE id = 'poi-124';
-- poi-127: "Рафтинг на Тереке"
UPDATE public.pois SET slug = 'rafting-na-tereke' WHERE id = 'poi-127';
-- poi-128: "Параглайдинг над горами Осетии"
UPDATE public.pois SET slug = 'paraglayding-nad-gorami-osetii' WHERE id = 'poi-128';
-- poi-129: "Конные прогулки по горам Осетии"
UPDATE public.pois SET slug = 'konnye-progulki-po-goram-osetii' WHERE id = 'poi-129';
-- poi-130: "Горнолыжный курорт «Цей»"
UPDATE public.pois SET slug = 'gornolyzhnyy-kurort-tsey' WHERE id = 'poi-130';
-- poi-131: "Верёвочный парк"
UPDATE public.pois SET slug = 'veryovochnyy-park' WHERE id = 'poi-131';
-- poi-132: "Скалодром RockStar"
UPDATE public.pois SET slug = 'skalodrom-rockstar' WHERE id = 'poi-132';
-- poi-133: "Велопрокат на набережной"
UPDATE public.pois SET slug = 'veloprokat-na-naberezhnoy' WHERE id = 'poi-133';
-- poi-134: "Каньонинг Мидаграбин"
UPDATE public.pois SET slug = 'kanoning-midagrabin' WHERE id = 'poi-134';
-- poi-135: "Железнодорожный вокзал Владикавказ"
UPDATE public.pois SET slug = 'zheleznodorozhnyy-vokzal-vladikavkaz' WHERE id = 'poi-135';
-- poi-136: "Автовокзал Владикавказ"
UPDATE public.pois SET slug = 'avtovokzal-vladikavkaz' WHERE id = 'poi-136';
-- poi-137: "Аэропорт Беслан (OGZ)"
UPDATE public.pois SET slug = 'aeroport-beslan-ogz' WHERE id = 'poi-137';
-- poi-138: "Почта России (центральное отделение)"
UPDATE public.pois SET slug = 'pochta-rossii-tsentralnoe-otdelenie' WHERE id = 'poi-138';
-- poi-139: "Сбербанк (центральный)"
UPDATE public.pois SET slug = 'sberbank-tsentralnyy' WHERE id = 'poi-139';
-- poi-140: "Банкомат Тинькофф"
UPDATE public.pois SET slug = 'bankomat-tinkoff' WHERE id = 'poi-140';
-- poi-141: "Центр путешествий «Кавказ»"
UPDATE public.pois SET slug = 'tsentr-puteshestviy-kavkaz' WHERE id = 'poi-141';
-- poi-142: "TopRent прокат авто"
UPDATE public.pois SET slug = 'toprent-prokat-avto' WHERE id = 'poi-142';

-- ============================================================================
-- Post-update: index on slug_legacy for redirect lookup performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pois_slug_legacy
  ON public.pois (slug_legacy)
  WHERE slug_legacy IS NOT NULL AND slug_legacy != slug;

COMMENT ON COLUMN public.pois.slug_legacy IS
  'Original English slug preserved for 301 redirects. Set to slug itself for POIs that did not change. Used by nginx redirects on brobrogid.ru and app.brobrogid.ru.';
