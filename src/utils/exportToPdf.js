import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  alefRegularBase64, 
  alefBoldBase64, 
  ALEF_FONT_NAME, 
  ALEF_REGULAR_FONT_FILE, 
  ALEF_BOLD_FONT_FILE 
} from './fonts/AlefBase64';
import { DIRECTION_RTL } from '../config/schema';

const DEFAULT_FILENAME = 'export.pdf';
const CHUNK_SIZE = 1000; // Process 1000 rows per chunk
const LANDSCAPE_THRESHOLD = 7; // Use landscape if column count > 7

/**
 * Format a cell value for PDF export (convert to string, handle null/undefined).
 * @param {*} value
 * @returns {string}
 */
function formatPdfCell(value) {
  if (value == null) return '';
  return String(value);
}

/**
 * Fix RTL text for Hebrew characters.
 * Only reverses text containing Hebrew characters (preserves numbers and English).
 * @param {string} text
 * @returns {string}
 */
function fixRTL(text) {
  if (!text) return '';
  // Check if text contains Hebrew characters (Unicode range \u0590-\u05FF)
  return /[\u0590-\u05FF]/.test(text)
    ? text.split('').reverse().join('')
    : text;
}

/**
 * Yield control to the browser to keep UI responsive.
 * @returns {Promise<void>}
 */
function yieldToBrowser() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Export columns and rows to a PDF file and trigger download.
 * Uses chunked processing to avoid blocking the UI for large datasets.
 *
 * @param {Object} options
 * @param {Array<{ field: string, headerName?: string }>} options.columns - Column definitions (headerName optional, fallback to field).
 * @param {Object[]} options.rows - Row objects (values keyed by column.field).
 * @param {string} [options.filename='export.pdf'] - Download filename.
 * @param {Function} [options.onProgress] - Progress callback: (current: number, total: number) => void
 * @param {string} [options.direction='ltr'] - Text direction ('ltr' or 'rtl')
 * @param {string} [options.fontBase64] - Custom font base64 string (overrides default Alef Regular)
 * @param {string} [options.fontBoldBase64] - Custom bold font base64 string (overrides default Alef Bold)
 * @param {string} [options.fontName] - Custom font name (overrides default 'Alef')
 * @param {string} [options.fontFile] - Custom font file name for VFS (overrides default 'Alef-Regular.ttf')
 * @param {string} [options.fontBoldFile] - Custom bold font file name for VFS (overrides default 'Alef-Bold.ttf')
 * @returns {Promise<void>}
 */
export async function exportToPdf({ 
  columns = [], 
  rows = [], 
  filename = DEFAULT_FILENAME, 
  onProgress,
  direction = 'ltr',
  fontBase64,
  fontBoldBase64,
  fontName,
  fontFile,
  fontBoldFile
} = {}) {
  const isRTL = direction === DIRECTION_RTL;
  
  // Determine font settings (default to Alef)
  const finalFontBase64 = fontBase64 || alefRegularBase64;
  const finalFontBoldBase64 = fontBoldBase64 || alefBoldBase64;
  const finalFontName = fontName || ALEF_FONT_NAME;
  const finalFontFile = fontFile || ALEF_REGULAR_FONT_FILE;
  const finalFontBoldFile = fontBoldFile || ALEF_BOLD_FONT_FILE;

  if (columns.length === 0 || rows.length === 0) {
    // Create empty PDF
    const doc = new jsPDF();
    
    // Register fonts even for empty PDF
    if (finalFontBase64 && finalFontBase64 !== 'PLACEHOLDER_BASE64_STRING') {
      doc.addFileToVFS(finalFontFile, finalFontBase64);
      doc.addFont(finalFontFile, finalFontName, 'normal');
      if (finalFontBoldBase64 && finalFontBoldBase64 !== 'PLACEHOLDER_BASE64_STRING') {
        doc.addFileToVFS(finalFontBoldFile, finalFontBoldBase64);
        doc.addFont(finalFontBoldFile, finalFontName, 'bold');
      }
      doc.setFont(finalFontName);
    }
    
    doc.text('No data to export', 14, 20);
    doc.save(filename);
    return;
  }

  // Determine orientation based on column count
  const useLandscape = columns.length > LANDSCAPE_THRESHOLD;
  const orientation = useLandscape ? 'landscape' : 'portrait';

  // Create PDF document
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  // Register fonts for Hebrew support (Regular and Bold)
  if (finalFontBase64 && finalFontBase64 !== 'PLACEHOLDER_BASE64_STRING') {
    // Register Regular font
    doc.addFileToVFS(finalFontFile, finalFontBase64);
    doc.addFont(finalFontFile, finalFontName, 'normal');
    
    // Register Bold font if available
    if (finalFontBoldBase64 && finalFontBoldBase64 !== 'PLACEHOLDER_BASE64_STRING') {
      doc.addFileToVFS(finalFontBoldFile, finalFontBoldBase64);
      doc.addFont(finalFontBoldFile, finalFontName, 'bold');
    }
    
    doc.setFont(finalFontName);
  }

  // Reverse column order for RTL
  const processedColumns = isRTL ? [...columns].reverse() : columns;

  // Prepare headers with RTL text fixing
  const headers = processedColumns.map((col) => {
    const headerText = col.headerName ?? col.field;
    return isRTL ? fixRTL(headerText) : headerText;
  });

  // Process rows in chunks to avoid blocking UI
  const totalRows = rows.length;
  let processedRows = 0;
  let isFirstPage = true;

  for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const chunkData = chunk.map((row) =>
      processedColumns.map((col) => {
        const cellValue = formatPdfCell(row[col.field]);
        return isRTL ? fixRTL(cellValue) : cellValue;
      })
    );

    // Add table to PDF
    doc.autoTable({
      head: isFirstPage ? [headers] : [],
      body: chunkData,
      startY: isFirstPage ? undefined : doc.lastAutoTable.finalY + 10,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        font: finalFontBase64 && finalFontBase64 !== 'PLACEHOLDER_BASE64_STRING' ? finalFontName : undefined,
        fontStyle: 'normal',
        halign: isRTL ? 'right' : 'left',
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        font: finalFontBase64 && finalFontBase64 !== 'PLACEHOLDER_BASE64_STRING' ? finalFontName : undefined,
        fontStyle: 'bold',
        halign: isRTL ? 'right' : 'left',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    processedRows += chunk.length;
    isFirstPage = false;

    // Report progress
    if (onProgress) {
      onProgress(processedRows, totalRows);
    }

    // Yield control to browser to keep UI responsive
    if (i + CHUNK_SIZE < totalRows) {
      await yieldToBrowser();
    }
  }

  // Save and download PDF
  doc.save(filename);
}
