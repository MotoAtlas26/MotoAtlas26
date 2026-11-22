/**
 * Convierte una imagen a SVG embebido (mismo formato que 800MT-X.svg)
 * Uso: node scripts/image-to-svg.js <imagen> <nombre-salida>
 * Ej: node scripts/image-to-svg.js ktm.png KTM-1290-S-Adv-S.svg
 */

const fs = require('fs')
const path = require('path')

const inputFile = process.argv[2]
const outputFile = process.argv[3] || 'output.svg'

if (!inputFile) {
  console.error('Uso: node scripts/image-to-svg.js <imagen> [nombre-salida]')
  process.exit(1)
}

try {
  const imageBuffer = fs.readFileSync(inputFile)
  const base64Data = imageBuffer.toString('base64')
  
  // Detectar tipo de imagen
  const ext = path.extname(inputFile).toLowerCase()
  let mimeType = 'image/webp'
  if (ext === '.png') mimeType = 'image/png'
  else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg'
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="612" height="408" viewBox="0 0 612 408">
  <image width="612" height="408" href="data:${mimeType};base64,${base64Data}" />
</svg>`
  
  fs.writeFileSync(outputFile, svgContent)
  console.log(`SVG guardado: ${outputFile} (${(svgContent.length / 1024).toFixed(1)} KB)`)
} catch (error) {
  console.error('Error:', error.message)
  process.exit(1)
}