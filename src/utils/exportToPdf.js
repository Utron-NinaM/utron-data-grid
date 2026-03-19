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

const HEBREW_REGEX = /[\u0590-\u05FF]/;
/** Max chars per line for long single-line Hebrew so PDF wraps in logical order. */
const RTL_WRAP_LINE_LENGTH = 50;

/**
 * Flip parentheses in a string so they display correctly after reversal (LTR PDF).
 * @param {string} s
 * @returns {string}
 */
function flipParentheses(s) {
  return s.replace(/\(/g, '\u200B').replace(/\)/g, '(').replace(/\u200B/g, ')');
}

/**
 * Fix RTL text for Hebrew: reverse runs that contain Hebrew and flip parentheses.
 * For long single-line Hebrew, pre-splits into segments and reverses segment order
 * so the PDF shows the first part of the sentence on the first line.
 * @param {string} text
 * @returns {string}
 */
function fixRTL(text) {
  if (!text) return '';
  const str = String(text);
  const lines = str.split(/\r?\n/);
  const processed = lines.map((line) => {
    if (!HEBREW_REGEX.test(line)) return line;
    const reversed = line.split('').reverse().join('');
    return flipParentheses(reversed);
  });
  const result = processed.join('\n');
  // Long single-line Hebrew: pre-split so PDF wrap order is logical (first line = start of sentence)
  if (lines.length === 1 && HEBREW_REGEX.test(result) && result.length > RTL_WRAP_LINE_LENGTH) {
    const chunks = [];
    for (let i = 0; i < result.length; i += RTL_WRAP_LINE_LENGTH) {
      chunks.push(result.slice(i, i + RTL_WRAP_LINE_LENGTH));
    }
    return chunks.reverse().join('\n');
  }
  return result;
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
    try {
      // Create empty PDF
      const doc = new jsPDF();
      
      // Register fonts even for empty PDF
      if (finalFontBase64 && finalFontBase64 !== 'PLACEHOLDER_BASE64_STRING') {
        try {
          doc.addFileToVFS(finalFontFile, finalFontBase64);
          doc.addFont(finalFontFile, finalFontName, 'normal');
          if (finalFontBoldBase64 && finalFontBoldBase64 !== 'PLACEHOLDER_BASE64_STRING') {
            doc.addFileToVFS(finalFontBoldFile, finalFontBoldBase64);
            doc.addFont(finalFontBoldFile, finalFontName, 'bold');
          }
          doc.setFont(finalFontName);
        } catch (fontError) {
          console.error('PDF font registration failed:', fontError);
          throw new Error('Failed to register fonts for PDF export');
        }
      }
      
      doc.text('No data to export', 14, 20);
      doc.save(filename);
      return;
    } catch (error) {
      console.error('PDF export failed (empty data):', error);
      throw error;
    }
  }

  try {
    // Determine orientation based on column count
    const useLandscape = columns.length > LANDSCAPE_THRESHOLD;
    const orientation = useLandscape ? 'landscape' : 'portrait';

    // Create PDF document
    let doc;
    try {
      doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    } catch (pdfError) {
      console.error('PDF document creation failed:', pdfError);
      throw new Error('Failed to create PDF document');
    }

    // Register fonts for Hebrew support (Regular and Bold)
    if (finalFontBase64 && finalFontBase64 !== 'PLACEHOLDER_BASE64_STRING') {
      try {
        // Register Regular font
        doc.addFileToVFS(finalFontFile, finalFontBase64);
        doc.addFont(finalFontFile, finalFontName, 'normal');
        
        // Register Bold font if available
        if (finalFontBoldBase64 && finalFontBoldBase64 !== 'PLACEHOLDER_BASE64_STRING') {
          doc.addFileToVFS(finalFontBoldFile, finalFontBoldBase64);
          doc.addFont(finalFontBoldFile, finalFontName, 'bold');
        }
        
        doc.setFont(finalFontName);
      } catch (fontError) {
        console.error('PDF font registration failed:', fontError);
        throw new Error('Failed to register fonts for PDF export');
      }
    }

    // Reverse column order for RTL
    const processedColumns = isRTL ? [...columns].reverse() : columns;

    // Prepare headers with RTL text fixing (Hebrew reversed in all cases)
    const headers = processedColumns.map((col) => {
      const headerText = col.headerName ?? col.field;
      return fixRTL(headerText);
    });

    // Process rows in chunks to avoid blocking UI
    const totalRows = rows.length;
    let processedRows = 0;
    let isFirstPage = true;

    for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
      try {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const chunkData = chunk.map((row) =>
          processedColumns.map((col) => {
            const cellValue = formatPdfCell(row[col.field]);
            return fixRTL(cellValue);
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
          try {
            onProgress(processedRows, totalRows);
          } catch (progressError) {
            console.error('Progress callback error:', progressError);
            // Continue processing even if progress callback fails
          }
        }

        // Yield control to browser to keep UI responsive
        if (i + CHUNK_SIZE < totalRows) {
          await yieldToBrowser();
        }
      } catch (chunkError) {
        console.error('PDF table generation failed at chunk:', chunkError);
        throw new Error('Failed to generate PDF table');
      }
    }

    // Save and download PDF
    try {
      doc.save(filename);
    } catch (saveError) {
      console.error('PDF save failed:', saveError);
      throw new Error('Failed to save PDF file');
    }
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}
