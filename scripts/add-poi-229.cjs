const fs = require('fs');
const pois = JSON.parse(fs.readFileSync('public/content/pois.json', 'utf8'));

const newPoi = {
  id: 'poi-229',
  slug: 'vechny-ogon-vladikavkaz',
  name: { ru: 'Вечный огонь', en: 'Eternal Flame' },
  category: 'culture',
  subcategory: 'memorial',
  location: {
    lat: 43.0185,
    lng: 44.6812,
    address: { ru: 'Проспект Коста, Владикавказ', en: 'Kosta Avenue, Vladikavkaz' }
  },
  description: {
    short: {
      ru: 'Мемориальный огонь в честь защитников Владикавказа, павших в Великой Отечественной войне.',
      en: 'Memorial flame honoring the defenders of Vladikavkaz who fell in the Great Patriotic War.'
    },
    medium: {
      ru: 'Вечный огонь во Владикавказе горит в память о защитниках города, остановивших немецкое наступление в ноябре 1942 года. Мемориальный комплекс открыт в 1967 году к 25-летию победы в Битве за Кавказ — одном из переломных сражений Второй мировой войны.',
      en: 'The Eternal Flame in Vladikavkaz burns in memory of the city defenders who stopped the German advance in November 1942. The memorial complex was opened in 1967 for the 25th anniversary of the victory in the Battle of the Caucasus — one of the turning points of World War II.'
    },
    full: {
      ru: 'Вечный огонь во Владикавказе — сердце мемориального комплекса, посвящённого героям Великой Отечественной войны. В октябре–ноябре 1942 года у стен тогдашнего Орджоникидзе разгорелось одно из решающих сражений Битвы за Кавказ. Немецкие войска группы армий «А», рвавшиеся к бакинской нефти и через Кавказский хребет в Закавказье, были остановлены и отброшены именно здесь — в нескольких километрах от городских улиц. Эта победа стала прологом к Сталинградскому контрнаступлению и переломила ход войны на южном направлении.\n\nМемориальный комплекс с Вечным огнём был торжественно открыт в 1967 году — ровно через 25 лет после битвы. Огонь не гаснет круглый год: он горит как символ вечной памяти о тысячах солдат, офицеров и мирных жителей, отдавших жизнь за город. На мемориальных плитах высечены имена погибших защитников.\n\nСегодня это место глубокого почитания: сюда приносят цветы в дни государственных праздников, здесь проходят торжественные церемонии 9 Мая, а молодожёны по традиции приезжают возложить букеты. Рядом расположена одна из станций Детской железной дороги, которая так и называется — «Вечный огонь».',
      en: 'The Eternal Flame in Vladikavkaz is the heart of the memorial complex dedicated to the heroes of the Great Patriotic War. In October–November 1942, one of the decisive battles of the Battle of the Caucasus took place at the walls of then-Ordzhonikidze. German forces of Army Group A, racing toward the Baku oil fields and across the Caucasus range into Transcaucasia, were stopped and driven back right here — just a few kilometers from the city streets. This victory foreshadowed the Stalingrad counteroffensive and turned the tide of the war on the southern front.\n\nThe memorial complex with the Eternal Flame was solemnly opened in 1967, exactly 25 years after the battle. The flame burns year-round as a symbol of eternal remembrance for the thousands of soldiers, officers, and civilians who gave their lives for the city. The memorial slabs bear the names of fallen defenders.\n\nToday this is a place of deep reverence: flowers are brought here on national holidays, solemn ceremonies take place on Victory Day (May 9th), and newlyweds traditionally come to lay bouquets. The children\'s railway station nearby is named "Eternal Flame" in its honor.'
    }
  },
  photos: ['/images/pois/vechny-ogon_gp.jpg'],
  rating: 4.8,
  reviewCount: 0,
  tags: ['мемориал', 'война', 'история', 'вечный огонь', 'ВОВ'],
  isChain: false,
  subscriptionTier: 'free',
  visitCount: 0,
  hasDelivery: false
};

pois.push(newPoi);
fs.writeFileSync('public/content/pois.json', JSON.stringify(pois, null, 2));
console.log('Added poi-229. Total POIs:', pois.length);
