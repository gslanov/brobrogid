const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '../public/images/pois')

const files = [
  'hotel-bumerang',
  'hotel-kameliya-v',
  'hotel-roots',
  'hotel-parkhotel-vladikavkaz',
]

const newPOIs = [
  {
    id: 'poi-174',
    slug: 'hotel-bumerang',
    name: { ru: 'Гостиница «Бумеранг»', en: 'Boomerang Hotel' },
    category: 'accommodation',
    subcategory: 'Гостиница',
    location: {
      lat: 43.0142,
      lng: 44.6543,
      address: {
        ru: 'ул. Васо Абаева, 69Б, Владикавказ, Респ. Северная Осетия — Алания',
        en: '69B Vaso Abaev St, Vladikavkaz'
      }
    },
    description: {
      short: {
        ru: 'Яркий двухэтажный отель 3★ в черно-красных тонах вблизи зоопарка Владикавказа.',
        en: 'A bright 3★ hotel in black and red near Vladikavkaz Zoo.'
      },
      medium: {
        ru: 'Гостиница «Бумеранг» — современный двухэтажный отель 3★ с запоминающимся черно-красным фасадом. Расположена вблизи зоопарка, 15 уютных номеров. Цены от 3 205 ₽/ночь.',
        en: 'Boomerang Hotel is a modern 3★ two-story hotel with a memorable black-and-red facade, located near the zoo. 15 cozy rooms from 3,205 RUB/night.'
      },
      full: {
        ru: 'Гостиница «Бумеранг» — современный отель категории 3 звезды с оригинальным черно-красным фасадом. Расположена в тихом районе Владикавказа вблизи зоопарка, в окружении зелени. 15 номеров различных категорий оснащены кондиционером, телевизором и всем необходимым для комфортного проживания. Территория отеля включает собственную парковку и аккуратно обустроенный двор. Цены от 3 205 ₽ в сутки.',
        en: 'Boomerang Hotel is a 3-star property with a distinctive black-and-red facade, situated in a quiet residential area near Vladikavkaz Zoo. 15 rooms of various categories are equipped with air conditioning, TV, and all the essentials for a comfortable stay. The property features on-site parking and a well-maintained courtyard. Rates from 3,205 RUB per night.'
      }
    },
    photos: ['/images/pois/hotel-bumerang.jpg'],
    rating: 4.6,
    reviewCount: 314,
    hours: { mon: '00:00-23:59' },
    phone: '+7 (8672) 53-40-00',
    website: 'http://boomerang-hotel.ru/',
    priceLevel: 2,
    tags: ['уютный отель', 'рядом с зоопарком', 'парковка', '3 звезды'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 3200,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-175',
    slug: 'hotel-kameliya-v',
    name: { ru: 'Гостиница «Камелия-В»', en: 'Kameliya-V Hotel' },
    category: 'accommodation',
    subcategory: 'Гостиница',
    location: {
      lat: 43.0247,
      lng: 44.6752,
      address: {
        ru: 'ул. Калинина, 1, Владикавказ, Респ. Северная Осетия — Алания',
        en: '1 Kalinina St, Vladikavkaz'
      }
    },
    description: {
      short: {
        ru: 'Уютная 3★ гостиница в центре Владикавказа с рестораном и кофейней.',
        en: 'A cozy 3★ hotel in central Vladikavkaz with restaurant and café.'
      },
      medium: {
        ru: 'Гостиница «Камелия-В» — 3★ отель в самом центре Владикавказа. 26 номеров, ресторан европейской кухни, кофейня, бесплатный Wi-Fi. Цены от 3 200 ₽/ночь.',
        en: 'Kameliya-V Hotel is a 3★ property in the very center of Vladikavkaz. 26 rooms, European restaurant, café, free Wi-Fi. Rates from 3,200 RUB/night.'
      },
      full: {
        ru: 'Гостиница «Камелия-В» расположена в историческом центре Владикавказа на улице Калинина. Отель категории 3 звезды предлагает 26 хорошо оснащённых номеров с кондиционером и бесплатным Wi-Fi. На территории работает ресторан европейской кухни и кофейня. К услугам гостей — прачечная, конференц-зал, собственная парковка и круглосуточная стойка регистрации. Рейтинг отеля — 4.5/5 на основе более 370 отзывов. Цены от 3 200 ₽ в сутки.',
        en: 'Kameliya-V Hotel is located in the historic center of Vladikavkaz on Kalinina Street. This 3-star property offers 26 well-equipped rooms with air conditioning and free Wi-Fi. The hotel features a European restaurant and café. Amenities include a laundry service, conference hall, private parking, and 24-hour front desk. Hotel rating is 4.5/5 based on over 370 reviews. Rates from 3,200 RUB per night.'
      }
    },
    photos: ['/images/pois/hotel-kameliya-v.jpg'],
    rating: 4.5,
    reviewCount: 376,
    hours: { mon: '00:00-23:59' },
    phone: '+7 (867) 251-86-00',
    website: 'https://kameliya-v-mini-hotel.rhotel.site/',
    priceLevel: 2,
    tags: ['центр города', 'ресторан', 'кофейня', '3 звезды'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 4100,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-176',
    slug: 'roots-park-otel',
    name: { ru: 'ROOTS Парк-отель', en: 'ROOTS Park Hotel' },
    category: 'accommodation',
    subcategory: 'Парк-отель',
    location: {
      lat: 42.8165,
      lng: 43.8835,
      address: {
        ru: 'Цейское ущелье, Верхний Цей, Северная Осетия — Алания',
        en: 'Tsey Gorge, Verkhniy Tsey, North Ossetia–Alania'
      }
    },
    description: {
      short: {
        ru: 'Бутик-отель в горах Цейского ущелья на высоте 1 900 м с панорамными коттеджами.',
        en: 'A boutique mountain hotel at 1,900m in Tsey Gorge with panoramic cottages.'
      },
      medium: {
        ru: 'ROOTS — концептуальный парк-отель в Цейском ущелье на высоте 1 900 м над уровнем моря. Уединённые коттеджи с панорамными окнами, вид на горные вершины. 90 минут от Владикавказа. Коттеджи от 14 100 ₽/ночь.',
        en: 'ROOTS is a boutique park hotel in Tsey Gorge at 1,900m altitude. Secluded cottages with panoramic windows and mountain views. 90 minutes from Vladikavkaz. Cottages from 14,100 RUB/night.'
      },
      full: {
        ru: 'ROOTS Парк-отель — бутик-отель в Цейском ущелье Северной Осетии на высоте 1 900 м над уровнем моря. Концепция: сочетание комфорта городского бутик-отеля с дикой горной природой. Уединённые коттеджи площадью 28 м² с панорамными окнами открывают вид на ущелье и вершины Большого Кавказа. Гостям доступны банный комплекс с горячей купелью, зоны барбекю, костровые площадки, конные маршруты и экологические тропы. Вблизи — подъёмник и святилище Реком. Расстояние от Владикавказа — 90 минут. Стоимость коттеджей от 14 100 ₽/ночь.',
        en: 'ROOTS Park Hotel is a boutique mountain retreat in the Tsey Gorge of North Ossetia at 1,900m above sea level. The concept blends city-boutique comfort with raw mountain nature. Standalone 28 m² cottages with panoramic windows frame views of the gorge and Greater Caucasus peaks. Guests enjoy a bath house with a hot tub, BBQ zones, fire pit areas, horse trekking routes, and eco-trails. The Recom Sanctuary and a ski lift are nearby. Distance from Vladikavkaz: 90 minutes. Cottages from 14,100 RUB/night.'
      }
    },
    photos: ['/images/pois/hotel-roots.jpg'],
    rating: 4.9,
    reviewCount: 89,
    hours: { mon: '00:00-23:59' },
    phone: '+7 928 928-63-28',
    website: 'https://rootshotel.ru/',
    priceLevel: 3,
    tags: ['горный отель', 'Цейское ущелье', 'коттеджи', 'панорамные виды', 'эко-отдых'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 2800,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-177',
    slug: 'park-otel-vladikavkaz',
    name: { ru: 'Парк Отель Владикавказ', en: 'Park Hotel Vladikavkaz' },
    category: 'accommodation',
    subcategory: 'Отель',
    location: {
      lat: 43.0271,
      lng: 44.6738,
      address: {
        ru: 'ул. Коцоева, 73А, Владикавказ, Респ. Северная Осетия — Алания, 362025',
        en: '73A Kotsoyeva St, Vladikavkaz'
      }
    },
    description: {
      short: {
        ru: 'Лучший отель Владикавказа 5★ с видом на горы и набережную Терека.',
        en: 'The finest 5★ hotel in Vladikavkaz with mountain and Terek embankment views.'
      },
      medium: {
        ru: 'Парк Отель Владикавказ — единственный 5★ отель в городе. 128 номеров с 12 этажей открывают панорамный вид на горы и набережную Терека. СПА, фитнес, ресторан. Номера от 14 500 ₽/ночь.',
        en: 'Park Hotel Vladikavkaz is the only 5★ hotel in the city. 128 rooms across 12 floors offer panoramic mountain and Terek embankment views. Spa, fitness center, restaurant. Rooms from 14,500 RUB/night.'
      },
      full: {
        ru: 'Парк Отель Владикавказ — единственный отель категории 5 звёзд во Владикавказе. Расположен в центре города на улице Коцоева. Современный 12-этажный комплекс на 128 номеров с панорамными видами на горные хребты и набережную реки Терек. К услугам гостей — СПА-центр с сауной и хамамом, фитнес-центр, ресторан с европейской кухней, бесплатный Wi-Fi и парковка. Идеально подходит для делового туризма и романтических поездок. Стандартные номера от 14 500 ₽, Suite от 33 000 ₽, Presidential Suite — от 85 000 ₽ в сутки.',
        en: 'Park Hotel Vladikavkaz is the only 5-star hotel in Vladikavkaz, centrally located on Kotsoyeva Street. The modern 12-floor, 128-room complex features panoramic views of the mountain ranges and the Terek River embankment. Amenities include a spa with sauna and hammam, fitness center, European restaurant, free Wi-Fi, and parking. Perfect for business travel and romantic getaways. Standard rooms from 14,500 RUB, Suites from 33,000 RUB, Presidential Suite from 85,000 RUB per night.'
      }
    },
    photos: ['/images/pois/hotel-parkhotel-vladikavkaz.jpg'],
    rating: 4.7,
    reviewCount: 523,
    hours: { mon: '00:00-23:59' },
    phone: '+7 800 550-13-15',
    website: 'https://parkhotel-vladikavkaz.ru/',
    priceLevel: 4,
    tags: ['5 звёзд', 'панорамный вид', 'СПА', 'фитнес', 'ресторан', 'бизнес-туризм'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 8500,
    hasMenu: false,
    hasDelivery: false
  }
]

async function run() {
  // Convert to webp
  for (const f of files) {
    const src = path.join(dir, `${f}.jpg`)
    const dst = path.join(dir, `${f}.webp`)
    try {
      await sharp(src).webp({ quality: 85 }).toFile(dst)
      console.log('webp OK:', f)
    } catch (e) {
      console.log('webp SKIP:', f, e.message)
    }
  }

  // Update pois.json
  const poisPath = path.join(__dirname, '../public/content/pois.json')
  const data = JSON.parse(fs.readFileSync(poisPath, 'utf8'))
  data.push(...newPOIs)
  fs.writeFileSync(poisPath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`pois.json updated — total: ${data.length} POIs`)
}

run()
