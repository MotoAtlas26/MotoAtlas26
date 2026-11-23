/**
 * Invoice Parser Utility
 * Extracts structured data from PDF invoices using pdfjs-dist
 * Provides regex-based parsing for Spanish invoice formats
 */

// Dynamic import for pdfjs-dist to avoid SSR issues
let pdfjsLib = null

async function loadPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  }
  return pdfjsLib
}

/**
 * Extract text content from a PDF file
 * @param {File|Blob|ArrayBuffer} file - PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPDF(file) {
  const pdfjs = await loadPdfjs()
  
  let arrayBuffer
  if (file instanceof File || file instanceof Blob) {
    arrayBuffer = await file.arrayBuffer()
  } else if (file instanceof ArrayBuffer) {
    arrayBuffer = file
  } else {
    throw new Error('Invalid file type for PDF extraction')
  }

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ')
    fullText += pageText + '\n'
  }

  return fullText
}

/**
 * Parse invoice text and extract structured data
 * @param {string} text - Raw text from PDF
 * @returns {Object} - Parsed invoice data
 */
export function parseInvoiceText(text) {
  const result = {
    date: null,
    invoiceNumber: null,
    odometerKm: null,
    workshopName: null,
    items: [],
    totalAmount: null,
    rawText: text
  }

  // Normalize text
  const normalizedText = text.replace(/\s+/g, ' ').trim()
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  // 1. Extract DATE - Multiple formats
  const datePatterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // DD de MES de YYYY (Spanish)
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i,
    // Fecha: DD/MM/YYYY
    /fecha[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    // Date: YYYY-MM-DD
    /date[:\s]+(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i
  ]

  for (const pattern of datePatterns) {
    const match = normalizedText.match(pattern)
    if (match) {
      let day, month, year
      if (pattern.source.includes('enero|febrero')) {
        // Spanish month name format
        day = parseInt(match[1])
        const monthNames = {
          enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
          julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
        }
        month = monthNames[match[2].toLowerCase()]
        year = parseInt(match[3])
      } else if (pattern.source.startsWith('(\\d{4})')) {
        // YYYY-MM-DD format
        year = parseInt(match[1])
        month = parseInt(match[2])
        day = parseInt(match[3])
      } else {
        // DD/MM/YYYY format
        day = parseInt(match[1])
        month = parseInt(match[2])
        year = parseInt(match[3])
      }
      
      if (year >= 2000 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        break
      }
    }
  }

  // 2. Extract INVOICE NUMBER
  const invoicePatterns = [
    /(?:factura|invoice|n[º°\.\s]*|num[.\s]*)[:\s]*([A-Z0-9\-\/]+)/i,
    /(?:serie|series)[:\s]*([A-Z0-9\-\/]+)/i,
    /^([A-Z]{1,3}[\-\/]?\d{4,})/m
  ]

  for (const pattern of invoicePatterns) {
    const match = normalizedText.match(pattern)
    if (match && match[1]) {
      result.invoiceNumber = match[1].trim().toUpperCase()
      break
    }
  }

  // 3. Extract ODOMETER/KILOMETERS
  const kmPatterns = [
    /(?:km|kil[oó]metros?|kilometraje|od[oó]metro)[:\s]*([\d\.\,]+)/i,
    /([\d\.\,]+)\s*km/i,
    /kilometraje[:\s]*([\d\.\,]+)/i
  ]

  for (const pattern of kmPatterns) {
    const match = normalizedText.match(pattern)
    if (match && match[1]) {
      const km = parseFloat(match[1].replace(/[,\.]/g, ''))
      if (!isNaN(km) && km > 0 && km < 1000000) {
        result.odometerKm = km
        break
      }
    }
  }

  // 4. Extract WORKSHOP NAME - Look for known patterns
  const workshopPatterns = [
    /(?:taller|workshop|concesionario|dealer)[:\s]*([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+?)(?:\n|$|,|\.|CIF|NIF)/i,
    /(?:emitido por|expedido por)[:\s]*([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+?)(?:\n|$|,|\.|CIF|NIF)/i
  ]

  for (const pattern of workshopPatterns) {
    const match = normalizedText.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      if (name.length > 3 && name.length < 100) {
        result.workshopName = name
        break
      }
    }
  }

  // 5. Extract LINE ITEMS
  // Pattern: Description - Quantity x Unit Price = Subtotal
  const itemPatterns = [
    // Standard: Description  Qty  UnitPrice  Total
    /([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\.\-\/\(\)]{5,80}?)\s+(\d+[,\.]?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/g,
    // With € symbol
    /([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\.\-\/\(\)]{5,80}?)\s+(\d+[,\.]?\d*)\s*[xX]\s*([\d,]+\.?\d*)\s*€?\s*([\d,]+\.?\d*)/g,
    // Simple: Description - Price
    /([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\.\-\/\(\)]{5,80}?)\s+([\d,]+\.?\d*)\s*€/g
  ]

  const items = []
  for (const pattern of itemPatterns) {
    let match
    pattern.lastIndex = 0
    while ((match = pattern.exec(normalizedText)) !== null) {
      const description = match[1].trim()
      const quantity = parseFloat(match[2].replace(',', '.'))
      const unitPrice = parseFloat(match[3].replace(',', '.'))
      const subtotal = match[4] ? parseFloat(match[4].replace(',', '.')) : quantity * unitPrice
      
      if (description.length > 3 && !isNaN(quantity) && !isNaN(unitPrice) && quantity > 0) {
        items.push({
          id: crypto.randomUUID(),
          description,
          category: categorizeItem(description),
          quantity,
          unitPrice,
          subtotal
        })
      }
    }
    if (items.length > 0) break
  }

  result.items = items

  // 6. Extract TOTAL AMOUNT
  const totalPatterns = [
    /(?:total|importe total|total a pagar|total factura)[:\s]*([\d,]+\.?\d*)\s*€/i,
    /(?:total|importe total|total a pagar|total factura)[:\s]*€\s*([\d,]+\.?\d*)/i,
    /TOTAL[:\s]*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*€\s*$/m
  ]

  for (const pattern of totalPatterns) {
    const match = normalizedText.match(pattern)
    if (match && match[1]) {
      const total = parseFloat(match[1].replace(',', '.'))
      if (!isNaN(total) && total > 0) {
        result.totalAmount = total
        break
      }
    }
  }

  // If no total found but we have items, calculate from items
  if (!result.totalAmount && items.length > 0) {
    result.totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  return result
}

/**
 * Categorize an invoice item based on description
 * @param {string} description - Item description
 * @returns {string} - Category
 */
function categorizeItem(description) {
  const desc = description.toLowerCase()
  
  if (desc.includes('aceite') || desc.includes('filtro') || desc.includes('lubricante')) {
    return 'Mantenimiento'
  }
  if (desc.includes('neumático') || desc.includes('rueda') || desc.includes('llanta') || desc.includes('goma')) {
    return 'Neumáticos'
  }
  if (desc.includes('freno') || desc.includes('pastilla') || desc.includes('disco')) {
    return 'Frenos'
  }
  if (desc.includes('cadena') || desc.includes('kit arrastre') || desc.includes('piñón') || desc.includes('corona')) {
    return 'Transmisión'
  }
  if (desc.includes('batería') || desc.includes('bateria')) {
    return 'Eléctrico'
  }
  if (desc.includes('revisión') || desc.includes('revision') || desc.includes('mantenimiento')) {
    return 'Mantenimiento'
  }
  if (desc.includes('mano de obra') || desc.includes('mano obra') || desc.includes('trabajo') || desc.includes('horas')) {
    return 'Mano de obra'
  }
  if (desc.includes('iva') || desc.includes('impuesto')) {
    return 'Impuestos'
  }
  
  return 'Otros'
}

/**
 * Match extracted workshop name with existing workshops in database
 * @param {string} extractedName - Workshop name from PDF
 * @param {Array} workshops - Array of workshop objects from Dexie
 * @returns {Object|null} - Matched workshop or null
 */
export function matchWorkshop(extractedName, workshops) {
  if (!extractedName || !workshops?.length) return null
  
  const normalizedExtracted = extractedName.toLowerCase().trim()
  
  // Exact match
  let match = workshops.find(w => w.name.toLowerCase() === normalizedExtracted)
  if (match) return match
  
  // Partial match (workshop name contains extracted or vice versa)
  match = workshops.find(w => 
    w.name.toLowerCase().includes(normalizedExtracted) || 
    normalizedExtracted.includes(w.name.toLowerCase())
  )
  if (match) return match
  
  // Fuzzy match - check significant words
  const extractedWords = normalizedExtracted.split(/\s+/).filter(w => w.length > 3)
  for (const workshop of workshops) {
    const workshopWords = workshop.name.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const commonWords = extractedWords.filter(w => workshopWords.includes(w))
    if (commonWords.length >= 2 || (commonWords.length === 1 && commonWords[0].length > 5)) {
      return workshop
    }
  }
  
  return null
}

/**
 * Main function to parse an invoice file
 * @param {File} file - PDF or image file
 * @param {Array} workshops - Existing workshops for matching
 * @returns {Promise<Object>} - Parsed invoice data with workshop match
 */
export async function parseInvoiceFile(file, workshops = []) {
  let text = ''
  
  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file)
  } else if (file.type.startsWith('image/')) {
    // For images, we'd need OCR - for now return empty
    // Could integrate Tesseract.js here in the future
    text = ''
  }
  
  const parsed = parseInvoiceText(text)
  const workshopMatch = matchWorkshop(parsed.workshopName, workshops)
  
  return {
    ...parsed,
    workshopMatch,
    fileName: file.name,
    fileMimeType: file.type,
    fileSize: file.size,
    extractedAt: new Date().toISOString(),
    isAutoExtracted: true
  }
}

export default {
  extractTextFromPDF,
  parseInvoiceText,
  parseInvoiceFile,
  matchWorkshop,
  categorizeItem
}