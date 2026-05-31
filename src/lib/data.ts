import type { PhotoKey } from './photos';

export type Place = {
  slug: string; name: string; cat: string; photo: PhotoKey;
  rating: string; reviews: number; dist: string;
  desc: string; getTo: string; entry: string; best: string;
};

export const PLACES: Record<string, Place> = {
  dzivgis: { slug: 'dzivgis', name: 'Дзивгисская крепость', cat: 'Крепость · Куртатинское ущелье', photo: 'dzivgis', rating: '4.8', reviews: 124, dist: '34 км от Владикавказа',
    desc: 'Уникальная наскальная крепость XIII–XVI веков, встроенная прямо в пещеры отвесной скалы. Шесть башен прикрывали вход в Куртатинское ущелье — главную дорогу средневековой Алании.', getTo: '40 мин на машине', entry: 'Бесплатно', best: 'Май – октябрь, утро' },
  midagrabin: { slug: 'midagrabin', name: 'Мидаграбинские водопады', cat: 'Природа · Гизельдонское ущелье', photo: 'midagrabin', rating: '4.9', reviews: 86, dist: '41 км от Владикавказа',
    desc: 'Каскад из восьми водопадов, самый высокий — Большой Зейгелан, до 750 метров. Полноводны в июле–августе, когда тают ледники.', getTo: '1 ч 10 мин на машине', entry: 'Бесплатно', best: 'Июль – август' },
  tsey: { slug: 'tsey', name: 'Цейское ущелье', cat: 'Природа · курорт', photo: 'tsey', rating: '4.8', reviews: 152, dist: '92 км от Владикавказа',
    desc: 'Ледник, минеральные источники и святилище Реком. Один из главных горных курортов Осетии с канатной дорогой и видами на Адайхох.', getTo: '2 ч на машине', entry: 'Бесплатно', best: 'Круглый год' },
  karmadon: { slug: 'karmadon', name: 'Кармадонское ущелье', cat: 'Природа · история', photo: 'karmadon', rating: '4.6', reviews: 61, dist: '28 км от Владикавказа',
    desc: 'Ущелье с тёплыми минеральными источниками и памятью о сходе ледника Колка 2002 года. Суровые и величественные виды.', getTo: '45 мин на машине', entry: 'Бесплатно', best: 'Май – октябрь' },
  fiagdon: { slug: 'fiagdon', name: 'Фиагдон', cat: 'Курорт · Куртатинское ущелье', photo: 'fiagdon', rating: '4.7', reviews: 73, dist: '38 км от Владикавказа',
    desc: 'Посёлок-курорт в Куртатинском ущелье, отправная точка к крепостям, монастырю и тропам. Удобная база для поездок по горам.', getTo: '50 мин на машине', entry: 'Бесплатно', best: 'Круглый год' },
  dargavs: { slug: 'dargavs', name: 'Город мёртвых Даргавс', cat: 'История · Гизельдонское ущелье', photo: 'dargavs', rating: '4.8', reviews: 140, dist: '37 км от Владикавказа',
    desc: 'Средневековый некрополь из 99 склепов-усыпальниц над долиной. Один из крупнейших памятников такого рода на Кавказе.', getTo: '1 ч на машине', entry: '150 ₽', best: 'Май – октябрь, день' },
  tsmyti: { slug: 'tsmyti', name: 'Цмити', cat: 'Башни · Куртатинское ущелье', photo: 'tsmyti', rating: '4.7', reviews: 54, dist: '46 км от Владикавказа',
    desc: 'Древнее родовое селение с боевыми и жилыми башнями, склепами и святилищами. Музей под открытым небом средневековой Алании.', getTo: '1 ч на машине', entry: 'Бесплатно', best: 'Май – октябрь' },
  rekom: { slug: 'rekom', name: 'Святилище Реком', cat: 'Святилище · Цейское ущелье', photo: 'rekom', rating: '4.7', reviews: 49, dist: '90 км от Владикавказа',
    desc: 'Одно из главных аланских святилищ, деревянный храм без единого гвоздя. Место традиционных молений и праздников.', getTo: '2 ч на машине', entry: 'Бесплатно', best: 'Лето' },
  pies: { slug: 'pies', name: 'Осетинские пироги', cat: 'Кухня · символ', photo: 'pies', rating: '4.9', reviews: 210, dist: 'Владикавказ',
    desc: 'Три пирога на столе — символ солнца, земли и воды. Уалибах с сыром, фыдджын с мясом, цахараджын с зеленью.', getTo: 'В городе', entry: '—', best: 'Круглый год' },
  cheese: { slug: 'cheese', name: 'Осетинский сыр', cat: 'Кухня · сыроварни', photo: 'cheese', rating: '4.7', reviews: 64, dist: 'Горные сёла',
    desc: 'Рассольный сыр из горного молока — основа осетинской кухни. На сыроварнях показывают весь процесс и дают попробовать.', getTo: 'Разные сёла', entry: '—', best: 'Круглый год' },
};

export const CATEGORIES: Record<string, { title: string; sub: string; hero: PhotoKey; places: string[] }> = {
  priroda: { title: 'Природа', sub: '32 места · горы и водопады', hero: 'midagrabin', places: ['midagrabin', 'tsey', 'karmadon', 'fiagdon'] },
  kreposti: { title: 'Крепости и башни', sub: '14 мест · средневековая Алания', hero: 'dzivgis', places: ['dzivgis', 'tsmyti', 'dargavs', 'rekom'] },
  eda: { title: 'Где поесть', sub: '22 места · осетинская кухня', hero: 'pies', places: ['pies', 'cheese'] },
};
