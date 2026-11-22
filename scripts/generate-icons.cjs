#!/usr/bin/env node
/**
 * Genera iconos PNG válidos para PWA desde el favicon.svg
 * Crea: icon-192.png, icon-512.png, apple-touch-icon.png (180x180)
 * Sin dependencias externas - genera PNGs válidos programáticamente
 */

const fs = require('fs');
const path = require('path');

// Función para crear un PNG válido con un color de fondo y un hexágono + M simple
function createPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // Helper para crear chunks
  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  
  // CRC32 simple
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: truecolor
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);
  
  // Crear datos de imagen simples: fondo #0D0D0F con un hexágono dorado y una M blanca
  // Usamos un patrón simple para generar pixels
  const pixels = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const hexRadius = Math.min(width, height) * 0.35;
  
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      // Fondo #0D0D0F (13, 13, 15)
      let r = 13, g = 13, b = 15;
      
      // Hexágono centrado
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Hexágono: 6 lados
      const hexAngle = (Math.PI / 3) * Math.floor((angle + Math.PI / 6) / (Math.PI / 3));
      const hexDist = hexRadius * Math.cos(Math.PI / 6) / Math.cos(angle - hexAngle);
      
      const inHexagon = dist <= hexDist;
      const onHexBorder = Math.abs(dist - hexDist) < Math.max(2, width / 100);
      
      if (inHexagon && !onHexBorder) {
        // Dentro del hexágono - color dorado suave #D2B474 (210, 180, 116)
        r = 210; g = 180; b = 116;
      } else if (onHexBorder) {
        // Borde del hexágono - dorado más intenso
        r = 200; g = 170; b = 100;
      }
      
      // Dibujar una "M" simple en el centro (blanco #F2F2F3 = 242, 242, 243)
      const mSize = Math.min(width, height) * 0.15;
      const mLeft = centerX - mSize * 1.5;
      const mRight = centerX + mSize * 1.5;
      const mTop = centerY - mSize;
      const mBottom = centerY + mSize;
      const strokeWidth = Math.max(2, width / 80);
      
      // M: dos verticales + dos diagonales
      const inM = 
        // Vertical izquierda
        (x >= mLeft - strokeWidth/2 && x <= mLeft + strokeWidth/2 && y >= mTop && y <= mBottom) ||
        // Vertical derecha
        (x >= mRight - strokeWidth/2 && x <= mRight + strokeWidth/2 && y >= mTop && y <= mBottom) ||
        // Diagonal izquierda (top-left a center)
        (x >= mLeft && x <= centerX && y >= mTop && y <= mBottom && 
         Math.abs(y - (mTop + (x - mLeft) * (mBottom - mTop) / (centerX - mLeft))) < strokeWidth) ||
        // Diagonal derecha (center a top-right)
        (x >= centerX && x <= mRight && y >= mTop && y <= mBottom && 
         Math.abs(y - (mBottom - (x - centerX) * (mBottom - mTop) / (mRight - centerX))) < strokeWidth);
      
      if (inM && inHexagon) {
        r = 242; g = 242; b = 243;
      }
      
      row.push(r, g, b);
    }
    // PNG filter byte (0 = none) + row data
    pixels.push(0, ...row);
  }
  
  const imageData = Buffer.from(pixels);
  
  // Comprimir con zlib (deflate)
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(imageData);
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generar iconos
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [
  { name: 'icon-192.png', width: 192, height: 192 },
  { name: 'icon-512.png', width: 512, height: 512 },
  { name: 'apple-touch-icon.png', width: 180, height: 180 }
];

for (const { name, width, height } of sizes) {
  const png = createPNG(width, height);
  const outPath = path.join(iconsDir, name);
  fs.writeFileSync(outPath, png);
  console.log(`✅ Generado: ${name} (${width}x${height})`);
}

console.log('\n🎉 Iconos PWA generados en public/icons/');