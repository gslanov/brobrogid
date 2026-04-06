import sharp from 'sharp'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const IMAGES_DIR = join(process.cwd(), 'public/images')

function getImageFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      files.push(...getImageFiles(fullPath))
    } else if (/\.(jpg|jpeg|png)$/i.test(entry)) {
      files.push(fullPath)
    }
  }
  return files
}

async function main() {
  const files = getImageFiles(IMAGES_DIR)
  console.log(`Found ${files.length} images to optimize`)

  let converted = 0
  for (const file of files) {
    const webpPath = file.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    try {
      await sharp(file).webp({ quality: 80 }).toFile(webpPath)
      converted++
      console.log(`✓ ${file.replace(IMAGES_DIR, '')} → .webp`)
    } catch (err) {
      console.error(`✗ ${file}:`, (err as Error).message)
    }
  }

  console.log(`\nConverted ${converted}/${files.length} images to WebP`)
}

main().catch(console.error)
