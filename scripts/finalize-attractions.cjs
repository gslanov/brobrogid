const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '../public/images/pois')

const files = [
  'pliev-house-museum',
  'vladikavkaz-history-museum',
  'vladikavkaz-zoo',
  'childrens-railway',
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

  const photoMap = {
    'poi-166': ['/images/pois/vladikavkaz-history-museum.jpg'],
    'poi-167': ['/images/pois/pliev-house-museum.jpg'],
    'poi-168': ['/images/pois/vladikavkaz-zoo.jpg'],
    'poi-169': ['/images/pois/childrens-railway.jpg'],
  }

  data.forEach(p => {
    if (photoMap[p.id]) p.photos = photoMap[p.id]
  })

  fs.writeFileSync(poisPath, JSON.stringify(data, null, 2), 'utf8')
  console.log('pois.json updated')
}

run()
