const fs = require('fs')
const path = require('path')

const poisPath = path.join(__dirname, '../public/content/pois.json')
const data = JSON.parse(fs.readFileSync(poisPath, 'utf8'))

const newPois = [
  {
    id: 'poi-164',
    slug: 'memorial-slavy',
    name: { ru: 'Мемориал Славы', en: 'Memorial of Glory' },
    category: 'attractions',
    subcategory: 'monument',
    location: { lat: 43.000882, lng: 44.677758, address: { ru: 'ул. Красногвардейская, Владикавказ', en: 'Krasnovardeiskaya St, Vladikavkaz' } },
    description: {
      short: { ru: 'Мемориальный комплекс в честь победы в Великой Отечественной войне — триумфальная арка, Аллея Славы и вечный огонь.', en: 'Memorial complex honoring WWII victory — a triumphal arch, Alley of Glory and eternal flame.' },
      medium: { ru: 'Мемориал Славы открыт в 2005 году на юге Владикавказа. Центральный вход — триумфальная арка с бронзовыми скульптурами двух солдат. За аркой — Аллея Славы с именами погибших уроженцев Осетии. Один из главных мемориальных комплексов республики.', en: 'The Memorial of Glory was opened in 2005 in southern Vladikavkaz. The triumphal arch entrance features bronze sculptures of two soldiers. Behind it — the Alley of Glory with the names of fallen Ossetians.' },
      full: { ru: 'Мемориал Славы — главный военный мемориал Северной Осетии, открытый в 2005 году. Комплекс занимает большую территорию на улице Красногвардейской. Триумфальная арка при входе увенчана двумя бронзовыми солдатами. Аллея Славы ведёт мимо плит с именами более пяти тысяч уроженцев республики, павших в Великой Отечественной. В глубине комплекса горит вечный огонь. Место, где Владикавказ помнит.', en: 'The Memorial of Glory is the main military memorial of North Ossetia, opened in 2005. The triumphal arch is crowned with two bronze soldiers. The Alley of Glory leads past plaques bearing the names of over five thousand natives of the republic who fell in WWII. At the far end burns an eternal flame.' }
    },
    photos: [],
    rating: 4.7,
    reviewCount: 0,
    tags: ['мемориал', 'история', 'ВОВ', 'обязательно к посещению'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-165',
    slug: 'pliev-monument',
    name: { ru: 'Памятник генералу Исса Плиеву', en: 'Monument to General Issa Pliev' },
    category: 'attractions',
    subcategory: 'monument',
    location: { lat: 43.019819, lng: 44.680087, address: { ru: 'площадь Генерала Плиева, Владикавказ', en: 'General Pliev Square, Vladikavkaz' } },
    description: {
      short: { ru: 'Конный памятник прославленному осетинскому генералу — одна из самых узнаваемых скульптур города.', en: 'Equestrian monument to the legendary Ossetian general — one of the city\'s most recognizable sculptures.' },
      medium: { ru: 'Исса Плиев — генерал армии, дважды Герой Советского Союза, уроженец Осетии. Конный памятник установлен на площади его имени. Скульптура изображает Плиева в полном военном облачении верхом на коне.', en: 'Issa Pliev — Army General, twice Hero of the Soviet Union, native of Ossetia. The equestrian monument stands on the square bearing his name.' },
      full: { ru: 'Исса Александрович Плиев родился в 1903 году в Осетии. Выдающийся советский военачальник, командовавший конно-механизированными группами в годы Великой Отечественной. Дважды Герой Советского Союза, Герой МНР. В 1962 году командовал советскими войсками на Кубе. Конный памятник на площади его имени — один из самых выразительных монументов Владикавказа, работа скульптора Юрия Чернова.', en: 'Issa Pliev was born in 1903 in Ossetia. An outstanding Soviet military commander, he led cavalry-mechanized groups during WWII. Twice Hero of the Soviet Union. In 1962 he commanded Soviet forces in Cuba. The equestrian monument on the square bearing his name is one of the most expressive monuments in Vladikavkaz.' }
    },
    photos: [],
    rating: 4.5,
    reviewCount: 0,
    tags: ['памятник', 'история', 'конная скульптура'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-166',
    slug: 'vladikavkaz-history-museum',
    name: { ru: 'Музей истории Владикавказа', en: 'Vladikavkaz History Museum' },
    category: 'attractions',
    subcategory: 'museum',
    location: { lat: 43.034926, lng: 44.682355, address: { ru: 'ул. Революции, 61, Владикавказ', en: 'Revolyutsii St, 61, Vladikavkaz' } },
    description: {
      short: { ru: 'Музей в историческом здании с экспозицией об истории города от крепости XIX века до наших дней.', en: 'Museum in a historic building with an exhibition on the city\'s history from the 19th-century fortress to today.' },
      medium: { ru: 'Музей истории Владикавказа расположен в историческом центре города. Экспозиция охватывает период от основания крепости в 1784 году до современности. Документы, фотографии, предметы быта, военные артефакты — всё о превращении пограничной крепости в столицу Северной Осетии.', en: 'The museum covers the period from the founding of the fortress in 1784 to the present. Documents, photographs, everyday objects, military artifacts tell the story of this border fortress becoming the capital of North Ossetia.' },
      full: { ru: 'Музей истории Владикавказа — хранилище городской памяти. Здесь можно увидеть как выглядел Владикавказ в разные эпохи: планы крепости 1784 года, фотографии дореволюционного «Кавказского Петербурга», документы советского времени. Отдельные залы посвящены Великой Отечественной войне, обороне Кавказа и послевоенному восстановлению. Экспонаты помогают понять, как небольшая военная крепость стала крупным городом с богатой историей.', en: 'The museum is a repository of urban memory. You can see how Vladikavkaz looked in different eras: fortress plans from 1784, photos of pre-revolutionary "Caucasian Petersburg", Soviet-era documents. Separate halls cover WWII and the defense of the Caucasus.' }
    },
    photos: [],
    rating: 4.3,
    reviewCount: 0,
    hours: { tue: '10:00–18:00', wed: '10:00–18:00', thu: '10:00–18:00', fri: '10:00–18:00', sat: '10:00–18:00', sun: '10:00–18:00' },
    tags: ['музей', 'история', 'Владикавказ'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-167',
    slug: 'pliev-house-museum',
    name: { ru: 'Дом-музей генерала Плиева', en: 'General Pliev House-Museum' },
    category: 'attractions',
    subcategory: 'museum',
    location: { lat: 43.030397, lng: 44.687801, address: { ru: 'ул. Бородинская, 7, Владикавказ', en: 'Borodinskaya St, 7, Vladikavkaz' } },
    description: {
      short: { ru: 'Мемориальная квартира дважды Героя Советского Союза генерала Исса Плиева с личными вещами и наградами.', en: 'Memorial apartment of twice Hero of the Soviet Union General Issa Pliev, with personal belongings and awards.' },
      medium: { ru: 'Дом-музей Исса Плиева открыт в квартире, где жил прославленный генерал. Личные вещи, два ордена Золотой Звезды, военное снаряжение, документы и фотографии с маршалами Жуковым, Коневым и Рокоссовским.', en: 'The Pliev House-Museum is open in the apartment where the legendary general lived. Personal belongings, two Orders of the Gold Star, military equipment, photos with Marshals Zhukov, Konev and Rokossovsky.' },
      full: { ru: 'Дом-музей Исса Плиева — камерное и трогательное место. Квартира сохранена почти в том виде, в каком её оставил генерал: личный кабинет с картами и книгами, коллекция наград, фотографии со Сталиным, Жуковым и другими маршалами. Здесь чувствуется масштаб человека, чьё имя носит одна из центральных площадей Владикавказа. Музей небольшой, но посещение занимает около часа.', en: 'The Pliev House-Museum is an intimate place. The apartment is preserved almost as the general left it: his personal study with maps and books, award collection, photographs with Stalin, Zhukov and other marshals. A place to feel the scale of the man whose name graces one of the central squares of Vladikavkaz.' }
    },
    photos: [],
    rating: 4.4,
    reviewCount: 0,
    hours: { tue: '10:00–17:00', wed: '10:00–17:00', thu: '10:00–17:00', fri: '10:00–17:00', sat: '10:00–17:00' },
    tags: ['музей', 'история', 'военная история'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-168',
    slug: 'vladikavkaz-zoo',
    name: { ru: 'Зоопарк Владикавказа', en: 'Vladikavkaz Zoo' },
    category: 'attractions',
    subcategory: 'park',
    location: { lat: 42.995925, lng: 44.676758, address: { ru: 'просп. Коста, 24, Владикавказ', en: 'Kosta Ave, 24, Vladikavkaz' } },
    description: {
      short: { ru: 'Городской зоопарк с более чем 200 видами животных, в том числе кавказскими — горными козлами, турами и леопардами.', en: 'City zoo with over 200 animal species including Caucasian mountain goats, tur and leopards.' },
      medium: { ru: 'Зоопарк Владикавказа — один из немногих зоопарков Северного Кавказа. На территории около 10 гектаров содержится более 200 видов животных: кавказские туры, серны, леопарды, а также жирафы, слоны, зебры. Популярное место для семейного отдыха. Рядом — Детская железная дорога.', en: 'One of the few zoos in the North Caucasus. Its 10 hectares house over 200 species including Caucasian tur, chamois, leopards, as well as giraffes, elephants and zebras. Adjacent to the Children\'s Railway.' },
      full: { ru: 'Зоопарк Владикавказа расположен на проспекте Коста. Коллекция включает кавказские эндемики — виды, которых большинство горожан никогда не видело в дикой природе: туры, серны, кавказские леопарды. Есть и африканская экзотика. Зоопарк постепенно модернизируется. Хорошее место для семейного дня, особенно если совместить с поездкой на Детской железной дороге — она в 200 метрах.', en: 'The Vladikavkaz Zoo is located on Kosta Avenue. The collection includes Caucasian endemics: tur, chamois, Caucasian leopards — animals most city residents have never seen in the wild. There is also African wildlife. A good place for a family day, especially combined with a ride on the Children\'s Railway 200m away.' }
    },
    photos: [],
    rating: 4.1,
    reviewCount: 0,
    hours: { mon: '10:00–18:00', tue: '10:00–18:00', wed: '10:00–18:00', thu: '10:00–18:00', fri: '10:00–18:00', sat: '10:00–18:00', sun: '10:00–18:00' },
    priceLevel: 1,
    phone: '+7 (867) 253-36-36',
    tags: ['зоопарк', 'семья', 'природа', 'дети'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-169',
    slug: 'childrens-railway',
    name: { ru: 'Детская железная дорога', en: "Children's Railway" },
    category: 'attractions',
    subcategory: 'park',
    location: { lat: 42.996498, lng: 44.676422, address: { ru: 'просп. Коста, 30, Владикавказ', en: 'Kosta Ave, 30, Vladikavkaz' } },
    description: {
      short: { ru: 'Миниатюрная железная дорога 4,5 км — один из старейших детских аттракционов Кавказа, работает с 1940-х годов.', en: 'A 4.5 km miniature railway — one of the oldest children\'s attractions in the Caucasus, operating since the 1940s.' },
      medium: { ru: 'Детская железная дорога Владикавказа работает с 1940-х годов. Маршрут 4,5 км проходит через живописный парк, поездка занимает около 20 минут. Летом здесь многолюдно — горожане приходят целыми семьями. Работает только в тёплый сезон, с мая по октябрь.', en: 'The Children\'s Railway has been operating since the 1940s. The 4.5 km route runs through a picturesque park. The ride takes about 20 minutes. Open May–October only.' },
      full: { ru: 'Детская железная дорога Владикавказа — один из немногих сохранившихся детских железнодорожных маршрутов на Кавказе. Небольшие тепловозы тянут состав из разноцветных вагонов по кольцу через парк. Узкоколейка 750 мм, настоящая тяга — это не просто аттракцион, а уменьшенная копия настоящей железной дороги. Дорога работает только в тёплое время года, с мая по октябрь. Рядом — зоопарк и городской парк.', en: 'The Children\'s Railway of Vladikavkaz is one of the few remaining children\'s railways in the Caucasus. Small diesel locomotives pull colorful carriages around a loop through the park. Operating May to October only. Adjacent to the city zoo.' }
    },
    photos: [],
    rating: 4.4,
    reviewCount: 0,
    priceLevel: 1,
    tags: ['дети', 'парк', 'аттракцион', 'семья'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-170',
    slug: 'kosta-khetagurov-monument',
    name: { ru: 'Памятник Коста Хетагурову', en: 'Kosta Khetagurov Monument' },
    category: 'attractions',
    subcategory: 'monument',
    location: { lat: 43.032336, lng: 44.669010, address: { ru: 'ул. Карла Маркса, 70, Владикавказ', en: 'Karl Marx St, 70, Vladikavkaz' } },
    description: {
      short: { ru: 'Памятник основоположнику осетинской литературы и национальному поэту Коста Хетагурову.', en: 'Monument to the founder of Ossetian literature and national poet Kosta Khetagurov.' },
      medium: { ru: 'Коста Хетагуров (1859–1906) — осетинский поэт, художник, публицист, основоположник осетинской литературы. Его имя носят парк, улицы, проспект и театр во Владикавказе. Памятник установлен на улице Карла Маркса.', en: 'Kosta Khetagurov (1859–1906) was an Ossetian poet, artist, publicist, and the founder of Ossetian literature. The monument stands on Karl Marx Street.' },
      full: { ru: 'Коста Хетагуров — фигура, без которой невозможно понять Осетию. Поэт, писавший на осетинском и русском языках, художник и общественный деятель. Его сборник «Осетинская лира» (Ирон фандыр) стал первым литературным произведением на осетинском языке. Именем Коста названы главный парк Владикавказа, проспект и государственный театр. Памятник на улице Карла Маркса стоит среди старых домов дореволюционной застройки, в которой поэт и провёл большую часть жизни.', en: 'Kosta Khetagurov is a figure without whom Ossetia cannot be understood. A poet writing in Ossetian and Russian, his collection "Ossetian Lyre" (Iron Fandyr) was the first literary work in the Ossetian language. The city\'s main park, avenue and state theatre all bear his name. The monument stands among the pre-revolutionary buildings where the poet spent much of his life.' }
    },
    photos: [],
    rating: 4.5,
    reviewCount: 0,
    tags: ['памятник', 'Коста Хетагуров', 'история', 'литература'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-171',
    slug: 'north-ossetian-philharmonic',
    name: { ru: 'Северо-Осетинская государственная филармония', en: 'North Ossetian State Philharmonic' },
    category: 'attractions',
    subcategory: 'concert_hall',
    location: { lat: 43.036710, lng: 44.677840, address: { ru: 'ул. Миллера, 34, Владикавказ', en: 'Millera St, 34, Vladikavkaz' } },
    description: {
      short: { ru: 'Главная концертная площадка республики в здании бывшей лютеранской церкви 1824 года постройки.', en: "The republic's main concert venue, housed in a former Lutheran church built in 1824." },
      medium: { ru: 'Северо-Осетинская филармония расположена в здании бывшей лютеранской церкви Святого Архангела Михаила (1824) — памятнике архитектуры. В концертном зале проходят симфонические концерты, выступления ансамбля «Алан» и других коллективов.', en: 'The Philharmonic is housed in the former Lutheran Church of St. Michael (1824), an architectural landmark. The concert hall hosts symphonic performances and the Alan ensemble.' },
      full: { ru: 'Это здание — один из парадоксов Владикавказа. Лютеранская кирха 1824 года постройки сегодня служит главным концертным залом республики. Строгий немецкий неоклассицизм неожиданно красиво смотрится на фоне кавказского пейзажа. Внутри хорошая акустика, программы от классики до народной осетинской музыки. Государственный ансамбль «Алан», ансамбли традиционного пения, симфонические концерты — стоит проверить афишу. И в любом случае заглянуть ради здания снаружи — оно выглядит как привет из другой эпохи.', en: 'This building is one of the paradoxes of Vladikavkaz. A Lutheran church built in 1824 serves as the republic\'s main concert hall. Strict German neo-classicism looks unexpectedly beautiful against a Caucasian backdrop. Good acoustics inside, programs ranging from classical to traditional Ossetian music. Worth checking the schedule — and worth stopping by just to see the building from outside.' }
    },
    photos: [],
    rating: 4.5,
    reviewCount: 0,
    phone: '+7 (867) 253-04-09',
    website: 'http://filarmoniya-vladikavkaz.ru/',
    tags: ['концерт', 'музыка', 'архитектура', 'культура'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-172',
    slug: 'steinghel-mansion',
    name: { ru: 'Особняк барона Штейнгеля', en: 'Baron Steinghel Mansion' },
    category: 'attractions',
    subcategory: 'architecture',
    location: { lat: 43.027351, lng: 44.678987, address: { ru: 'ул. Максима Горького, 6, Владикавказ', en: 'Maxima Gorkogo St, 6, Vladikavkaz' } },
    description: {
      short: { ru: 'Один из красивейших дореволюционных особняков Владикавказа — памятник архитектуры федерального значения, конец XIX века.', en: 'One of the most beautiful pre-revolutionary mansions in Vladikavkaz, a federally protected architectural monument from the late 19th century.' },
      medium: { ru: 'Особняк барона Штейнгеля — памятник архитектуры федерального значения. Построен в конце XIX века в стиле эклектики с элементами ренессанса. Богатый лепной декор, арочные окна, угловая башня делают особняк одним из самых красивых исторических зданий Владикавказа.', en: 'The Steinghel Mansion is a federally protected architectural monument. Built in the late 19th century in eclectic style with Renaissance elements. Rich stucco decor, arched windows and a corner tower make it one of the most beautiful historic buildings in Vladikavkaz.' },
      full: { ru: 'Владикавказ конца XIX века часто называли «Кавказским Петербургом» — и особняк Штейнгеля объясняет почему. Богатые купцы и чиновники строили здесь дома не хуже столичных. Этот особняк с его роскошным лепным фасадом, арочными окнами и угловой башенкой — один из лучших примеров той эпохи. Сегодня здание используется как административное. Стоит пройти мимо, особенно если идти по Проспекту Мира — особняк в полутора кварталах от него.', en: 'Late 19th-century Vladikavkaz was often called the "Caucasian Petersburg" — the Steinghel Mansion explains why. This mansion with its ornate facade, arched windows and corner tower is one of the finest examples of that era. Today used as an office building. Worth a stop if walking near Prospekt Mira — it\'s a block and a half away.' }
    },
    photos: [],
    rating: 4.3,
    reviewCount: 0,
    tags: ['архитектура', 'XIX век', 'исторический центр'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  },
  {
    id: 'poi-173',
    slug: 'ilyinskaya-church',
    name: { ru: 'Ильинская церковь', en: 'Church of St. Elijah' },
    category: 'attractions',
    subcategory: 'church',
    location: { lat: 43.019673, lng: 44.664538, address: { ru: 'ул. Дзержинского, 70, Владикавказ', en: 'Dzerzhinskogo St, 70, Vladikavkaz' } },
    description: {
      short: { ru: 'Одна из старейших православных церквей Владикавказа, основанная в 1796 году — первый приход города.', en: 'One of the oldest Orthodox churches in Vladikavkaz, established in 1796 — the city\'s first parish.' },
      medium: { ru: 'Ильинская церковь — первая православная церковь Владикавказа. Первоначальное здание возведено в 1796 году. Освящена в честь пророка Илии. Скромный по размерам, но значимый по истории храм — он старше большинства городских кварталов.', en: 'The Church of St. Elijah is the first Orthodox church of Vladikavkaz. The original building was erected in 1796, dedicated to the Prophet Elijah. Modest in size but historically significant — older than most city blocks.' },
      full: { ru: 'Ильинская церковь стоит здесь с 1796 года — она старше многих кварталов современного Владикавказа. Первоначально деревянная, позже перестроенная в камне, церковь сохранила значение православного прихода Осетинской слободы. Внешне неприметная, она важна как памятник первых лет существования города. Вокруг — тихие улочки старого Владикавказа, в которых ещё чувствуется дух XIX века.', en: 'The Church of St. Elijah has stood here since 1796 — older than many blocks of modern Vladikavkaz. Originally wooden, later rebuilt in stone, the church retained its significance as a parish of the Ossetian settlement. Externally understated, it is an important monument to the city\'s earliest years.' }
    },
    photos: [],
    rating: 4.3,
    reviewCount: 0,
    tags: ['церковь', 'православие', 'история', 'XIX век'],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false
  }
]

const updated = [...data, ...newPois]
fs.writeFileSync(poisPath, JSON.stringify(updated, null, 2), 'utf8')
console.log('Done. Total POIs:', updated.length)
console.log('New attractions added:', newPois.length)
const newAttr = updated.filter(p => p.category === 'attractions')
console.log('Total attractions now:', newAttr.length)
