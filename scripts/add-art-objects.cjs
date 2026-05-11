const fs = require('fs');
const pois = JSON.parse(fs.readFileSync('public/content/pois.json', 'utf8'));

const artObjects = [
  {
    id: 'poi-230',
    slug: 'sword-in-stone',
    name: { ru: 'Меч в камне', en: 'Sword in Stone' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.7933, lng: 44.3735, address: { ru: 'Мидаграбинская долина, Северная Осетия', en: 'Midagrabin Valley, North Ossetia' } },
    description: {
      short: { ru: 'Арт-объект: металлический клинок, воткнутый в пятиметровый камень посреди горной долины.', en: 'Art object: a metal blade thrust into a five-meter boulder in the heart of a mountain valley.' },
      medium: { ru: 'Гигантский металлический меч, пронзающий огромный камень — отсылка к нартскому эпосу и легенде о короле Артуре. Учёные считают, что история о мече в камне могла прийти в Европу именно от предков осетин — скифов и сарматов. Установлен в Мидаграбинской долине в 2021 году.', en: 'A giant metal sword piercing a massive boulder — a reference to the Nart epic and the Arthurian legend. Scholars believe the sword-in-stone tale may have reached Europe from the Scythians and Sarmatians, ancestors of the Ossetians. Installed in Midagrabin Valley in 2021.' },
      full: { ru: 'Арт-объект «Меч в камне» установлен в Мидаграбинской долине — одном из красивейших мест Северной Осетии, где расположены одни из самых высоких водопадов Европы. Металлический клинок, вонзённый в пятиметровый гранитный валун, отсылает сразу к двум великим эпосам: осетинским нартским сказаниям и западноевропейской легенде о короле Артуре.\n\nСвязь неслучайна: ряд историков и фольклористов полагает, что сюжет о мече, который способен вытащить из камня лишь истинный герой, пришёл в Европу от скифов и сарматов — кочевых народов, которые являются предками современных осетин. Этот арт-объект превращает горный пейзаж в живую иллюстрацию того, как древние осетинские предания могли дать импульс мировой культуре.\n\nВокруг объекта открывается панорама Мидаграбинских водопадов — каскада из семи водопадов, среди которых Большой Зейгалан высотой 600 метров входит в число крупнейших в Европе.', en: 'The "Sword in Stone" art object stands in Midagrabin Valley — one of the most spectacular areas of North Ossetia, home to some of the tallest waterfalls in Europe. A metal blade thrust into a five-meter granite boulder references two great epics at once: the Ossetian Nart sagas and the Arthurian legend.\n\nThe connection is no coincidence. Many historians and folklorists believe the tale of the sword only a true hero can draw from stone traveled to Europe through the Scythians and Sarmatians — nomadic peoples who are ancestors of modern Ossetians. This art object turns a mountain landscape into a living illustration of how ancient Ossetian tales may have shaped world culture.\n\nAround the object, the panorama of the Midagrabin waterfalls unfolds — a cascade of seven falls, among which the Great Zeygalan at 600 meters is one of the tallest in Europe.' }
    },
    photos: ['/images/pois/sword-in-stone_gp.jpg'],
    rating: 4.7, reviewCount: 0, tags: ['арт-объект', 'нарты', 'горы', 'история', 'скульптура'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-231',
    slug: 'mirror-snow-leopard',
    name: { ru: 'Зеркальный барс', en: 'Mirror Snow Leopard' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.8827, lng: 44.3268, address: { ru: 'Кадаргаванский каньон, Северная Осетия', en: 'Kadargavan Canyon, North Ossetia' } },
    description: {
      short: { ru: 'Скульптура барса, покрытая зеркальными элементами — символ исчезающего переднеазиатского леопарда, изображённого на гербе Осетии.', en: 'A leopard sculpture covered in mirror elements — symbol of the endangered Caucasian leopard depicted on the coat of arms of Ossetia.' },
      medium: { ru: 'Барс будто крадётся по скале, его тело частично отражает окружающий горный пейзаж и становится почти невидимым. Так арт-объект напоминает: переднеазиатский леопард — символ республики на гербе — находится под угрозой исчезновения. Установлен у входа в Кадаргаванский каньон в 2021 году.', en: 'The leopard seems to stalk the cliff face, its mirrored body reflecting the surrounding mountain landscape, rendering it almost invisible. The art object reminds us that the Caucasian leopard — the republic\'s heraldic symbol — is on the brink of extinction. Installed at the entrance to Kadargavan Canyon in 2021.' },
      full: { ru: 'Зеркальный барс установлен у Кадаргаванского каньона — узкой теснины с отвесными скалами высотой до 100 метров, по дну которой стремительно несётся река Ардон. Скульптура выполнена из металла и покрыта зеркальными фрагментами: хищник будто растворяется в пейзаже, отражая небо, скалы и деревья.\n\nЭтот художественный приём несёт глубокий смысл. Переднеазиатский леопард — редчайший подвид, занесённый в Красную книгу России. Именно он изображён на гербе и флаге Северной Осетии — Алании как символ силы, красоты и независимости горного народа. Сегодня в дикой природе Кавказа сохранились лишь единицы этих животных.\n\nКадаргаванский каньон сам по себе — одна из главных природных достопримечательностей республики. Через него проходит Транскавказская магистраль, и многие путешественники, следующие в Южную Осетию или возвращающиеся оттуда, останавливаются здесь, чтобы осмотреть каньон и зеркального барса.', en: 'The Mirror Snow Leopard stands at Kadargavan Canyon — a narrow gorge with sheer cliffs up to 100 meters tall, through which the Ardon River rushes. The sculpture is crafted from metal and covered with mirror fragments: the predator seems to dissolve into the landscape, reflecting sky, rock, and trees.\n\nThis artistic device carries deep meaning. The Caucasian leopard is a critically endangered subspecies listed in Russia\'s Red Book. It is depicted on the coat of arms and flag of North Ossetia-Alania as a symbol of the mountain people\'s strength, beauty, and independence. Today, only a handful of these animals survive in the wild Caucasus.\n\nKadargavan Canyon is itself one of the republic\'s premier natural attractions. The Trans-Caucasian Highway passes through it, and many travelers heading to or from South Ossetia stop here to take in the canyon and the mirrored leopard.' }
    },
    photos: ['/images/pois/mirror-snow-leopard_gp.jpg'],
    rating: 4.8, reviewCount: 0, tags: ['арт-объект', 'барс', 'каньон', 'скульптура', 'символ'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-232',
    slug: 'ossetian-alphabet-letter',
    name: { ru: 'Буква Æ', en: 'Letter Æ' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.8345, lng: 44.3689, address: { ru: 'Между Даргавсом и Фиагдоном, Северная Осетия', en: 'Between Dargavs and Fiagdon, North Ossetia' } },
    description: {
      short: { ru: 'Металлическая конструкция в виде уникальной буквы осетинского алфавита — одного из символов языка и идентичности осетинского народа.', en: 'A metal structure shaped as a unique letter of the Ossetian alphabet — a symbol of the language and identity of the Ossetian people.' },
      medium: { ru: 'Буква «Æ» — одна из самобытных букв осетинского алфавита, сохранённых при переводе языка на кириллицу. Она не имеет аналогов в русском алфавите и является символом уникальности осетинского языка. Арт-объект установлен на живописном горном маршруте между Даргавсом и Фиагдоном.', en: 'The letter "Æ" is one of the distinctive letters of the Ossetian alphabet, preserved when the language was transferred to Cyrillic script. It has no equivalent in the Russian alphabet and symbolizes the uniqueness of the Ossetian language. The art object stands on a scenic mountain route between Dargavs and Fiagdon.' },
      full: { ru: 'Арт-объект «Буква Æ» посвящён осетинскому языку — одному из немногих живых потомков скифо-сарматской языковой традиции, восходящей к иранской ветви индоевропейской семьи. Когда в XIX веке осетинский язык был переведён в письменную форму, а затем адаптирован под кириллицу, составители алфавита сохранили уникальный диграф «Æ/æ» — звук, не имеющий точного аналога ни в русском, ни в большинстве других кириллических алфавитов.\n\nМеталлическая конструкция выполнена в виде объёмной буквы, внутри которой можно сидеть и отдыхать. Расположена на высоте с панорамным видом на горные хребты. Маршрут от Даргавса — «города мёртвых» — до Фиагдона является одним из самых популярных в Куртатинском ущелье и проходит через несколько исторических осетинских сёл.\n\nЭтот арт-объект — не просто скульптура, но приглашение задуматься о том, как язык хранит идентичность народа на протяжении тысячелетий.', en: 'The "Letter Æ" art object is dedicated to the Ossetian language — one of the few living descendants of the Scythian-Sarmatian linguistic tradition, rooted in the Iranian branch of the Indo-European family. When the Ossetian language was committed to writing in the 19th century and later adapted to Cyrillic, alphabet creators preserved the unique digraph "Æ/æ" — a sound with no precise equivalent in Russian or most other Cyrillic-script languages.\n\nThe metal structure is shaped as a three-dimensional letter with space inside for resting. It sits at an elevation with panoramic views of mountain ridges. The route from Dargavs — the "City of the Dead" — to Fiagdon is one of the most popular in Kurtatinsky Gorge, passing through several historic Ossetian villages.\n\nThis art object is not just a sculpture, but an invitation to reflect on how language preserves a people\'s identity across millennia.' }
    },
    photos: ['/images/pois/ossetian-alphabet-letter_gp.jpg'],
    rating: 4.6, reviewCount: 0, tags: ['арт-объект', 'язык', 'культура', 'алфавит', 'горы'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-233',
    slug: 'kosta-khetagurov-portrait',
    name: { ru: 'Портрет Косты Хетагурова', en: 'Portrait of Kosta Khetagurov' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.6961, lng: 43.9768, address: { ru: 'Зарамагское водохранилище, Северная Осетия', en: 'Zaramag Reservoir, North Ossetia' } },
    description: {
      short: { ru: 'Уникальная скульптура из вертикальных металлических брусьев, складывающихся в портрет великого осетинского поэта под определённым углом.', en: 'A unique sculpture of vertical metal rods that resolve into a portrait of the great Ossetian poet when viewed from the right angle.' },
      medium: { ru: 'С одной точки — хаотичный лес металлических стержней. Под нужным углом — чёткий портрет Косты Хетагурова, основателя осетинской литературы. Оптическая иллюзия превращает встречу с арт-объектом в маленькое открытие. Установлен у живописного Зарамагского водохранилища.', en: 'From one point — a chaotic forest of metal rods. From the right angle — a clear portrait of Kosta Khetagurov, founder of Ossetian literature. The optical illusion turns the encounter into a small revelation. Installed beside the scenic Zaramag reservoir.' },
      full: { ru: 'Арт-объект создан в честь Косты Левановича Хетагурова (1859–1906) — осетинского поэта, художника и просветителя, которого называют основателем осетинской литературы и осетинского литературного языка. Его сборник «Осетинская лира» (Ирон фандыр), написанный на осетинском языке, стал первой книгой осетинской художественной литературы.\n\nТехника арт-объекта — анаморфная скульптура: вертикальные металлические стержни разной высоты расставлены так, что при взгляде строго с одной точки складываются в узнаваемый образ. С любого другого угла — это просто лес прутьев. Такой приём метафорически говорит о том, что понять и увидеть поэта можно лишь с правильной, внимательной позиции.\n\nЗарамагское водохранилище, у которого стоит объект, образовано плотиной Зарамагской ГЭС и окружено высокогорными хребтами. Это один из самых труднодоступных и потому нетронутых уголков Северной Осетии.', en: 'The art object honors Kosta Levanovich Khetagurov (1859–1906) — Ossetian poet, artist, and enlightener, considered the founder of Ossetian literature and the Ossetian literary language. His collection "Ossetian Lyre" (Iron Fandir), written in Ossetian, was the first book of Ossetian belles-lettres.\n\nThe technique is anamorphic sculpture: vertical metal rods of varying heights are arranged so that from exactly one vantage point they resolve into a recognizable face. From any other angle — just a forest of rods. This approach metaphorically suggests that to truly see and understand a poet, one must find the right, attentive perspective.\n\nThe Zaramag reservoir beside which the object stands was formed by the Zaramag hydroelectric dam and is surrounded by high-mountain ridges — one of the most remote and therefore untouched corners of North Ossetia.' }
    },
    photos: ['/images/pois/kosta-khetagurov-portrait_gp.jpg'],
    rating: 4.7, reviewCount: 0, tags: ['арт-объект', 'Коста Хетагуров', 'поэт', 'культура', 'скульптура'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-234',
    slug: 'balsag-wheel',
    name: { ru: 'Колесо Балсага', en: 'Wheel of Balsag' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.7850, lng: 44.3300, address: { ru: 'Даргавское ущелье, Северная Осетия', en: 'Dargavs Gorge, North Ossetia' } },
    description: {
      short: { ru: 'Скульптура огненного колеса из нартского эпоса — орудия пытки героя Сослана, ставшего символом испытания и воли.', en: 'Sculpture of the fiery wheel from the Nart epic — the instrument of Soslan\'s trial that became a symbol of endurance and will.' },
      medium: { ru: 'В нартском эпосе огненное колесо Балсага отрезало ноги непобедимому герою Сослану. Этот трагический образ стал одним из центральных в осетинской мифологии. Металлическая скульптура в горах Даргавского ущелья оживляет древнее предание, превращая легенду в ощутимый объект.', en: 'In the Nart epic, the fiery Wheel of Balsag severed the legs of the invincible hero Soslan. This tragic image became one of the central motifs in Ossetian mythology. The metal sculpture in the mountains of Dargavs Gorge brings the ancient tale to life, making the legend tangible.' },
      full: { ru: 'Нартский эпос — грандиозный цикл мифов и сказаний, общий для многих народов Кавказа, но наиболее полно сохранившийся у осетин. Герой Сослан (Созрыко) — один из главных нартских богатырей, рождённый из камня, закалённый в волчьем молоке, непобедимый в битвах.\n\nОднако именно Колесо Балсага — мистическое огненное колесо, наделённое разумом и злобой, — сумело погубить Сослана. Согласно эпосу, оно отрезало ему ноги, нанеся смертельную рану. Этот эпизод трактуется исследователями по-разному: как символ неизбежности судьбы, как напоминание о том, что у каждого героя есть слабость, или как астрономическая метафора солнечного диска.\n\nАрт-объект установлен в Даргавском ущелье — вблизи знаменитого «города мёртвых» Даргавса, где расположен средневековый некрополь. Соседство скульптуры с историческими склеповыми башнями создаёт особую атмосферу, где миф и реальная история переплетаются неразрывно.', en: 'The Nart epic is a grand cycle of myths and tales shared by many Caucasian peoples but most completely preserved among the Ossetians. Soslan (Sozryko) is one of the chief Nart heroes — born of stone, tempered in wolf\'s milk, invincible in battle.\n\nYet it was the Wheel of Balsag — a mystical fiery wheel endowed with intelligence and malice — that managed to destroy Soslan. According to the epic, it severed his legs, inflicting a mortal wound. Scholars interpret this episode variously: as a symbol of fate\'s inevitability, as a reminder that every hero has a weakness, or as an astronomical metaphor for the solar disc.\n\nThe art object stands in Dargavs Gorge — near the famous "City of the Dead" at Dargavs, site of a medieval necropolis. The sculpture\'s proximity to historic crypt towers creates a unique atmosphere where myth and real history intertwine inseparably.' }
    },
    photos: ['/images/pois/balsag-wheel_gp.jpg'],
    rating: 4.6, reviewCount: 0, tags: ['арт-объект', 'нарты', 'Сослан', 'мифология', 'скульптура'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-235',
    slug: 'horn-of-abundance',
    name: { ru: 'Рог изобилия', en: 'Horn of Abundance' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.7945, lng: 44.0041, address: { ru: 'Посёлок Бурон, Северная Осетия', en: 'Buron, North Ossetia' } },
    description: {
      short: { ru: 'Огромный рог, закреплённый цепями на скале у посёлка Бурон — символ богатства, гостеприимства и щедрости осетинского народа.', en: 'A massive horn chained to a cliff near Buron — symbol of the wealth, hospitality, and generosity of the Ossetian people.' },
      medium: { ru: 'Рог занимает особое место в осетинской культуре: на традиционном пиру старший поднимает рог с пивом или аракой и произносит тост. Арт-объект в виде исполинского рога на скале у посёлка Бурон превращает этот символ гостеприимства в монументальный образ, видимый с трассы А-164.', en: 'The drinking horn holds a special place in Ossetian culture: at a traditional feast, the elder raises a horn of beer or araka and offers a toast. The art object — a giant horn fastened to a cliff near Buron — turns this symbol of hospitality into a monumental image visible from highway A-164.' },
      full: { ru: 'Рог изобилия у посёлка Бурон стоит на стратегически важной точке: именно здесь Транскавказская магистраль (А-164) уходит в сторону Рокского тоннеля и Южной Осетии. Каждый, кто едет в горы или возвращается оттуда, видит этот монументальный символ.\n\nВ осетинской традиции рог — не просто сосуд для напитков. Он неотъемлемая часть ритуала застолья — «куывда». Без рога нет настоящего осетинского пира: тот, кто поднимает его, берёт на себя ответственность старшего и произносит молитву-тост. Передать рог другому — значит передать честь и слово.\n\nАрт-объект выкован из металла и закреплён цепями прямо на скальной породе, создавая ощущение, что рог вырастает из самой горы. Бурон расположен у слияния рек Ардон и Закка, в окружении скал и лесов. Рядом — Нарское ущелье и Цейское ущелье, богатые альпийскими пейзажами.', en: 'The Horn of Abundance near Buron stands at a strategically important point: this is where the Trans-Caucasian Highway (A-164) branches toward the Roki Tunnel and South Ossetia. Everyone traveling into the mountains or returning passes this monumental symbol.\n\nIn Ossetian tradition, the horn is more than a vessel for drinks. It is an integral part of the "kuvd" feast ritual. Without a horn there is no true Ossetian banquet: whoever raises it takes on the responsibility of the elder and offers a prayer-toast. To pass the horn is to pass honor and one\'s word.\n\nThe art object is forged from metal and fastened with chains directly into the rock face, creating the impression that the horn grows from the mountain itself. Buron lies at the confluence of the Ardon and Zakka rivers, surrounded by cliffs and forests, near the Nar and Tsey gorges with their alpine landscapes.' }
    },
    photos: ['/images/pois/horn-of-abundance_gp.jpg'],
    rating: 4.7, reviewCount: 0, tags: ['арт-объект', 'рог', 'традиции', 'скульптура', 'гостеприимство'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-236',
    slug: 'dagger-dance',
    name: { ru: 'Танец с кинжалами', en: 'Dagger Dance' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.8712, lng: 43.9577, address: { ru: 'Селение Верхний Згид, Северная Осетия', en: 'Upper Zgid village, North Ossetia' } },
    description: {
      short: { ru: 'Скульптура джигита, исполняющего традиционный осетинский танец с кинжалами — дань воинской культуре горного народа.', en: 'Sculpture of a horseman performing the traditional Ossetian dagger dance — a tribute to the warrior culture of the mountain people.' },
      medium: { ru: 'Танец с кинжалами был распространён в Осетии до конца XIX века и отражал воинскую доблесть горца. Скульптура в селении Верхний Згид — в одном из самых отдалённых ущелий республики — воссоздаёт этот образ: фигура в динамике, кинжалы подняты, как на пике танца.', en: 'The dagger dance was practiced in Ossetia until the late 19th century, expressing the martial valor of mountain warriors. The sculpture in the remote village of Upper Zgid captures this image: a figure in motion, daggers raised at the peak of the dance.' },
      full: { ru: 'Арт-объект «Танец с кинжалами» установлен в Садонском ущелье, у селения Верхний Згид — одного из наиболее труднодоступных населённых пунктов Северной Осетии. Добраться сюда непросто, что делает встречу со скульптурой особенно ценной для тех, кто преодолел дорогу.\n\nТанец с кинжалами — «карды кафт» — особый вид осетинского мужского танца, демонстрировавший ловкость, реакцию и бесстрашие воина. В отличие от парных танцев, этот исполнялся соло и нередко сопровождался реальными кинжалами. К концу XIX века традиция начала угасать, но в фольклорных коллективах её элементы сохранились до наших дней.\n\nМеталлическая фигура передаёт момент кульминации — когда тело и оружие слиты в единый порыв. На фоне суровых скал Садонского ущелья, где работали крупные свинцово-цинковые рудники, этот образ звучит особенно мощно: здесь жили люди, умевшие и трудиться, и воевать, и танцевать.', en: 'The "Dagger Dance" art object stands in Sadon Gorge, near the village of Upper Zgid — one of the most remote settlements in North Ossetia. The journey is not easy, which makes the encounter with the sculpture especially meaningful for those who make the trip.\n\nThe dagger dance — "kardy kaft" — was a special form of Ossetian men\'s dance demonstrating a warrior\'s agility, reflexes, and fearlessness. Unlike paired dances, it was performed solo and often with real daggers. By the late 19th century the tradition began fading, but elements were preserved in folk ensembles to this day.\n\nThe metal figure captures the climactic moment — when body and weapon merge in a single impulse. Against the severe cliffs of Sadon Gorge, where major lead-zinc mines once operated, this image resonates with particular power: here lived people who knew how to labor, fight, and dance.' }
    },
    photos: ['/images/pois/dagger-dance_gp.jpg'],
    rating: 4.6, reviewCount: 0, tags: ['арт-объект', 'танец', 'традиции', 'воинская культура', 'скульптура'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-237',
    slug: 'soslan-arrows',
    name: { ru: 'Стрелы Сослана', en: 'Arrows of Soslan' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.9807, lng: 43.7767, address: { ru: 'Село Мацута, Дигорское ущелье, Северная Осетия', en: 'Matsuta village, Digor Gorge, North Ossetia' } },
    description: {
      short: { ru: 'Три исполинские металлические стрелы в горах Дигории — памятник нартскому герою Сослану и его неиссякаемой силе.', en: 'Three giant metal arrows in the mountains of Digoria — a monument to the Nart hero Soslan and his inexhaustible strength.' },
      medium: { ru: 'Сослан — непобедимый герой нартского эпоса, чьи стрелы разили любого врага. Три металлические стрелы исполинского размера у села Мацута стоят как напоминание о мощи нартов — легендарных предков осетин. Дигорское ущелье — одно из красивейших в республике с живописными водопадами и средневековыми башнями.', en: 'Soslan is the invincible hero of the Nart epic, whose arrows struck down any foe. Three giant metal arrows near Matsuta village stand as a reminder of the power of the Narts — the legendary ancestors of the Ossetians. Digor Gorge is one of the most scenic in the republic, with picturesque waterfalls and medieval towers.' },
      full: { ru: 'Арт-объект «Стрелы Сослана» находится в Дигорском ущелье — одном из самых живописных и относительно малоизвестных мест Северной Осетии. Три огромные металлические стрелы, вонзённые в землю рядом с селом Мацута, отсылают к нартскому герою Сослану.\n\nВ осетинском эпосе Сослан обладал оружием, перед которым не устоять ни смертному, ни существу иного мира. Его стрелы летели туда, куда он посылал их мысленно, и никогда не возвращались без добычи. Образ трёх стрел — это и мощь, и точность, и неотвратимость.\n\nДигорское ущелье, где стоит объект, — особый мир: здесь живут дигорцы, говорящие на дигорском диалекте осетинского языка, и сохранились уникальные средневековые родовые башни. Рядом — Задалеск, Ханаз, Дунта. Природа ущелья поражает: альпийские луга, бурные реки, водопады и хребты, уходящие за 3000 метров.', en: 'The "Arrows of Soslan" art object stands in Digor Gorge — one of the most scenic and relatively little-known places in North Ossetia. Three massive metal arrows thrust into the earth near Matsuta village reference the Nart hero Soslan.\n\nIn the Ossetian epic, Soslan possessed weapons that no mortal or otherworldly creature could withstand. His arrows flew wherever he directed them in thought and never returned without prey. The image of three arrows conveys power, precision, and inevitability.\n\nDigor Gorge, where the object stands, is a world apart: here live the Digorians, speakers of the Digor dialect of Ossetian, and unique medieval clan towers have survived. Nearby are Zadaleskh, Khanaz, and Dunta. The gorge\'s nature is extraordinary: alpine meadows, rushing rivers, waterfalls, and ridges reaching beyond 3,000 meters.' }
    },
    photos: ['/images/pois/soslan-arrows_gp.jpg'],
    rating: 4.7, reviewCount: 0, tags: ['арт-объект', 'нарты', 'Сослан', 'Дигория', 'скульптура'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-238',
    slug: 'bench-horn',
    name: { ru: 'Скамья в виде рога', en: 'Horn Bench' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 43.0590, lng: 43.8098, address: { ru: 'Каньон Ахсинта, Дигорское ущелье, Северная Осетия', en: 'Akhsinta Canyon, Digor Gorge, North Ossetia' } },
    description: {
      short: { ru: 'Скамья-рог со встроенной подсветкой у каньона Ахсинта — место отдыха с видом на одну из самых эффектных теснин Дигории.', en: 'A horn-shaped bench with built-in lighting at Akhsinta Canyon — a rest spot with a view of one of Digoria\'s most dramatic gorges.' },
      medium: { ru: 'Каньон Ахсинта — живописная теснина с отвесными стенами в Дигорском ущелье. Арт-объект в виде рога с подсветкой стоит прямо над обрывом, предлагая остановиться и насладиться видом. Вечером, когда включается подсветка, рог светится на фоне гор — один из самых необычных объектов маршрута.', en: 'Akhsinta Canyon is a dramatic gorge with sheer walls in Digor Gorge. The lit horn-shaped bench stands right at the cliff edge, inviting travelers to pause and take in the view. In the evening, when the lighting comes on, the horn glows against the mountains — one of the most unusual objects on the route.' },
      full: { ru: 'Арт-объект «Скамья в виде рога» установлен на краю каньона Ахсинта — одной из самых впечатляющих природных достопримечательностей Дигорского ущелья. Теснина образована рекой Урух, которая на протяжении нескольких километров прорезала в скалах узкий коридор с почти вертикальными стенами.\n\nСкамья выполнена в виде рога — одного из главных символов осетинской культуры. Внутрь конструкции встроена подсветка, которая включается в вечернее время. В сумерках и ночью рог светится мягким светом на фоне тёмных скал, превращая практичный объект для отдыха в настоящую арт-инсталляцию.\n\nВ отличие от большинства других арт-объектов маршрута, этот прежде всего функционален: путешественники могут сесть, перевести дух и сфотографироваться с видом на каньон. Ахсинта — обязательная точка на пути в Дигорское ущелье, к Стур-Дигорскому заповеднику и далее к альпийским лугам у ледника Таймази.', en: 'The "Horn Bench" art object stands at the edge of Akhsinta Canyon — one of the most impressive natural attractions in Digor Gorge. The gorge was carved by the Urukhriver, which over several kilometers has cut a narrow corridor through the rock with nearly vertical walls.\n\nThe bench is shaped as a horn — one of the primary symbols of Ossetian culture. Built-in lighting activates in the evening hours. At dusk and night, the horn glows with soft light against dark cliffs, transforming a practical rest spot into a true art installation.\n\nUnlike most other art objects on the route, this one is primarily functional: travelers can sit, catch their breath, and photograph the canyon view. Akhsinta is a mandatory stop on the way into Digor Gorge, toward the Stur-Digor nature reserve and beyond to the alpine meadows near Taimazi glacier.' }
    },
    photos: ['/images/pois/bench-horn_gp.jpg'],
    rating: 4.5, reviewCount: 0, tags: ['арт-объект', 'рог', 'каньон', 'Дигория', 'подсветка'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  },
  {
    id: 'poi-239',
    slug: 'khsisin-fandir',
    name: { ru: 'Хъисын фандыр', en: 'Khsisin Fandir' },
    category: 'culture',
    subcategory: 'art-object',
    location: { lat: 42.9225, lng: 43.8367, address: { ru: 'У Галиатского водопада, Дигорское ущелье, Северная Осетия', en: 'Near Galiat Waterfall, Digor Gorge, North Ossetia' } },
    description: {
      short: { ru: 'Пятиметровая скульптура хъисын фандыра — традиционного осетинского смычкового инструмента, предка скрипки и балалайки.', en: 'A five-meter sculpture of the khsisin fandir — the traditional Ossetian bowed instrument, ancestor of the violin and balalaika.' },
      medium: { ru: 'Хъисын фандыр — старинный осетинский струнный инструмент со смычком, на котором пели нартские сказания. Одни исследователи считают его предком скрипки, другие — балалайки. Пятиметровая металлическая скульптура стоит у Галиатского водопада в Дигорском ущелье, воспевая музыкальное наследие осетинского народа.', en: 'The khsisin fandir is an ancient Ossetian bowed string instrument used to sing the Nart sagas. Some scholars consider it an ancestor of the violin, others of the balalaika. The five-meter metal sculpture stands near Galiat Waterfall in Digor Gorge, celebrating the musical heritage of the Ossetian people.' },
      full: { ru: 'Арт-объект «Хъисын фандыр» посвящён одному из старейших музыкальных инструментов Кавказа. Хъисын фандыр — смычковый инструмент с двумя-тремя струнами из конского волоса — использовался осетинскими сказителями для исполнения нартских эпических песен. Историки музыки прослеживают его родство с европейскими смычковыми и центральноазиатскими инструментами, что говорит о древних культурных связях осетин.\n\nПятиметровая скульптура установлена рядом с Галиатским водопадом — живописным многоступенчатым каскадом в Дигорском ущелье. Шум воды создаёт естественный акустический фон для немого инструмента, зафиксированного в металле. В тёплое время года здесь устраивают музыкальные перформансы и этнофестивали.\n\nГалиат — старинное осетинское село, сохранившее средневековые башни и склепы. Вместе с арт-объектом это место превращается в точку пересечения прошлого и настоящего: древние камни, живая вода водопада и современная скульптура говорят об одном — о неразрывной связи осетинской культуры с этой землёй.', en: 'The "Khsisin Fandir" art object is dedicated to one of the oldest musical instruments of the Caucasus. The khsisin fandir — a bowed instrument with two or three horsehair strings — was used by Ossetian storytellers to perform Nart epic songs. Music historians trace its kinship with European bowed instruments and Central Asian instruments, pointing to the Ossetians\' ancient cultural connections.\n\nThe five-meter sculpture stands beside Galiat Waterfall — a picturesque multi-tiered cascade in Digor Gorge. The sound of water creates a natural acoustic backdrop for the silent instrument frozen in metal. In warm months, musical performances and ethnofestivals are held here.\n\nGaliat is an ancient Ossetian village that has preserved medieval towers and crypts. Together with the art object, this place becomes a crossing point of past and present: ancient stones, living waterfall water, and a modern sculpture all speak of one thing — the unbreakable bond of Ossetian culture with this land.' }
    },
    photos: ['/images/pois/khsisin-fandir_gp.jpg'],
    rating: 4.8, reviewCount: 0, tags: ['арт-объект', 'музыка', 'нарты', 'инструмент', 'Дигория'],
    isChain: false, subscriptionTier: 'free', visitCount: 0, hasDelivery: false
  }
];

// Check for duplicates and add
const existingIds = new Set(pois.map(p => p.id));
let added = 0;
for (const poi of artObjects) {
  if (!existingIds.has(poi.id)) {
    pois.push(poi);
    added++;
  }
}

fs.writeFileSync('public/content/pois.json', JSON.stringify(pois, null, 2));
console.log(`Added ${added} POIs. Total: ${pois.length}`);
