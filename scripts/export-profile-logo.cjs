#!/usr/bin/env node
/**
 * Exporta el isotipo del logo MotoAtlas (hexágono + M) como imágenes de perfil
 * Genera: motoatlas-profile-512.jpg, motoatlas-profile-1024.jpg, motoatlas-hexagon.svg
 * Usa herramientas nativas de macOS (qlmanage, sips) - sin dependencias externas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores oficiales MotoAtlas
const BG_COLOR = '#0D0D0F';      // Fondo oscuro
const GOLD_COLOR = '#D2B474';    // Dorado principal
const M_COLOR = '#F2F2F3';       // Blanco suave para la M

// SVG vectorial limpio: solo hexágono + M (sin texto)
const HEXAGON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Fondo circular con margen de seguridad para recorte circular de avatares -->
  <circle cx="256" cy="256" r="256" fill="${BG_COLOR}"/>
  
  <!-- Hexágono centrado (radio ~35% = 179px) con stroke dorado -->
  <polygon 
    points="256,56 435,148 435,364 256,456 77,364 77,148" 
    fill="none" 
    stroke="${GOLD_COLOR}" 
    stroke-width="24" 
    stroke-linejoin="miter"
  />
  
  <!-- M centrada en blanco suave -->
  <path 
    d="M144 384V128L256 208L368 128V384" 
    stroke="${M_COLOR}" 
    stroke-width="28" 
    stroke-linecap="square" 
    stroke-linejoin="miter"
    fill="none"
  />
</svg>`;

const EXPORTS_DIR = path.join(__dirname, '../exports');
const PUBLIC_ICONS_DIR = path.join(__dirname, '../public/icons');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeSVG() {
  const svgPath = path.join(EXPORTS_DIR, 'motoatlas-hexagon.svg');
  fs.writeFileSync(svgPath, HEXAGON_SVG);
  console.log(`✅ SVG vectorial: ${svgPath}`);
  return svgPath;
}

function renderWithQLManage(svgPath, size, outputName) {
  const outputDir = path.join(EXPORTS_DIR, `tmp_${size}`);
  ensureDir(outputDir);
  
  // qlmanage genera PNG con transparencia, lo convertimos a JPG con fondo
  try {
    execSync(`qlmanage -t -s ${size} -o "${outputDir}" "${svgPath}"`, { stdio: 'ignore' });
    
    // qlmanage crea archivo con nombre basado en el original
    const generatedFiles = fs.readdirSync(outputDir);
    const pngFile = generatedFiles.find(f => f.endsWith('.png'));
    
    if (pngFile) {
      const pngPath = path.join(outputDir, pngFile);
      const jpgPath = path.join(EXPORTS_DIR, outputName);
      
      // sips: convertir PNG -> JPG con fondo oscuro
      execSync(`sips -s format jpeg -s formatOptions 95 --setProperty profile "${pngPath}" --out "${jpgPath}"`, { stdio: 'ignore' });
      
      // Verificar y forzar dimensiones exactas con sips
      execSync(`sips -z ${size} ${size} "${jpgPath}"`, { stdio: 'ignore' });
      
      // Limpiar temp
      fs.rmSync(outputDir, { recursive: true, force: true });
      
      console.log(`✅ ${outputName} (${size}x${size}): ${jpgPath}`);
      return jpgPath;
    }
  } catch (e) {
    console.error(`❌ Error con qlmanage para ${size}px:`, e.message);
  }
  return null;
}

function renderWithSipsDirect(svgPath, size, outputName) {
  // Alternativa: usar sips directamente si qlmanage falla
  const jpgPath = path.join(EXPORTS_DIR, outputName);
  try {
    // sips puede leer SVG en macOS reciente
    execSync(`sips -s format jpeg -s formatOptions 95 -z ${size} ${size} "${svgPath}" --out "${jpgPath}"`, { stdio: 'ignore' });
    console.log(`✅ ${outputName} (${size}x${size}) via sips: ${jpgPath}`);
    return jpgPath;
  } catch (e) {
    console.error(`❌ Error con sips directo para ${size}px:`, e.message);
  }
  return null;
}

function copyToPublicIcons(jpgPath, size) {
  const destName = `profile-${size}.jpg`;
  const destPath = path.join(PUBLIC_ICONS_DIR, destName);
  ensureDir(PUBLIC_ICONS_DIR);
  if (fs.existsSync(jpgPath)) {
    fs.copyFileSync(jpgPath, destPath);
    console.log(`📋 Copiado a public/icons/: ${destName}`);
  } else {
    console.log(`⚠️  Archivo origen no existe: ${jpgPath}`);
  }
}

// Main
console.log('🎨 Generando assets de perfil MotoAtlas...\n');

ensureDir(EXPORTS_DIR);

const svgPath = writeSVG();

// Generar 512x512
let jpg512 = renderWithQLManage(svgPath, 512, 'motoatlas-profile-512.jpg');
if (!jpg512) jpg512 = renderWithSipsDirect(svgPath, 512, 'motoatlas-profile-512.jpg');
if (jpg512) copyToPublicIcons(jpg512, 512);

// Generar 1024x1024
let jpg1024 = renderWithQLManage(svgPath, 1024, 'motoatlas-profile-1024.jpg');
if (!jpg1024) jpg1024 = renderWithSipsDirect(svgPath, 1024, 'motoatlas-profile-1024.jpg');
if (jpg1024) copyToPublicIcons(jpg1024, 1024);

console.log('\n🎉 Listo. Archivos generados en:');
console.log(`   📁 ${EXPORTS_DIR}/`);
console.log(`      • motoatlas-hexagon.svg (vectorial)`);
console.log(`      • motoatlas-profile-512.jpg (512x512)`);
console.log(`      • motoatlas-profile-1024.jpg (1024x1024)`);
console.log(`   📁 ${PUBLIC_ICONS_DIR}/`);
console.log(`      • profile-512.jpg`);
console.log(`      • profile-1024.jpg`);