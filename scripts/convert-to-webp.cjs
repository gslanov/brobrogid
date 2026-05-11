const sharp = require('sharp')
const path = require('path')

const files = [
  'memorial-slavy',
  'pliev-monument',
  'kosta-khetagurov-monument',
  'north-ossetian-philharmonic',
  'steinghel-mansion',
  'ilyinskaya-church',
  'bike-rental-terek',
  'intourist-ossetia',
  'kasar-gorge',
]

const dir = path.join(__dirname, '../public/images/pois');

(async () => {
  for (const f of files) {
    const src = path.join(dir, `${f}.jpg`)
    const dst = path.join(dir, `${f}.webp`)
    try {
      await sharp(src).webp({ quality: 85 }).toFile(dst)
      console.log('OK:', f)
    } catch (e) {
      console.log('SKIP:', f, e.message)
    }
  }
})()
