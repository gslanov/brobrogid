const sharp = require('sharp')
const path = require('path')

const dest = path.join(__dirname, 'public/images/pois')

const files = [
  'tc-terek_gp.jpg',
  'flower-market_gp.jpg',
  'bookstore-bukva_gp.jpg',
  'jewelry-nart_gp.jpg',
  'atelier-chokha_gp.jpg',
  'souvenir-oset_gp.jpg',
  'daryal-beer_gp.jpg',
  'antique-vlad_gp.jpg',
  'taste-alania_gp.jpg',
  'edelweiss-outdoor_gp.jpg',
  'caucasian-herbs_gp.jpg',
  'alan-market_gp.jpg',
]

;(async () => {
  for (const file of files) {
    const input = path.join(dest, file)
    const output = path.join(dest, file.replace(/\.(jpg|jpeg|JPG)$/, '.webp'))
    try {
      await sharp(input).resize(1200, 800, { fit: 'cover' }).webp({ quality: 82 }).toFile(output)
      const fs = require('fs')
      const size = fs.statSync(output).size
      console.log(`OK ${file.replace(/\.(jpg|jpeg|JPG)$/, '.webp')}: ${size} bytes`)
    } catch (e) {
      console.log(`FAIL ${file}: ${e.message}`)
    }
  }
})()
