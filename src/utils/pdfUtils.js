import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Load a PDF file and return the PDFDocumentProxy.
 * @param {File|ArrayBuffer} source - PDF file or ArrayBuffer
 * @returns {Promise<pdfjsLib.PDFDocumentProxy>}
 */
export async function loadPdf(source) {
  const data = source instanceof File ? await source.arrayBuffer() : source;
  return pdfjsLib.getDocument({ data }).promise;
}

/**
 * Render a PDF page to a canvas element.
 * @param {pdfjsLib.PDFPageProxy} page - The PDF page proxy
 * @param {number} scale - Render scale (zoom factor)
 * @param {HTMLCanvasElement} [canvas] - Optional existing canvas
 * @returns {Promise<{canvas: HTMLCanvasElement, width: number, height: number}>}
 */
export async function renderPage(page, scale = 1.5, canvas = null) {
  const viewport = page.getViewport({ scale });
  const cvs = canvas || document.createElement('canvas');
  const ctx = cvs.getContext('2d');

  cvs.width = Math.floor(viewport.width);
  cvs.height = Math.floor(viewport.height);
  cvs.style.width = viewport.width + 'px';
  cvs.style.height = viewport.height + 'px';

  await page.render({ canvasContext: ctx, viewport }).promise;

  return {
    canvas: cvs,
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Get page count from a loaded PDF document.
 * @param {pdfjsLib.PDFDocumentProxy} pdfDoc
 * @returns {number}
 */
export function getPageCount(pdfDoc) {
  return pdfDoc.numPages;
}

/**
 * Get a specific page from the PDF document.
 * @param {pdfjsLib.PDFDocumentProxy} pdfDoc
 * @param {number} pageNumber - 1-indexed page number
 * @returns {Promise<pdfjsLib.PDFPageProxy>}
 */
export async function getPage(pdfDoc, pageNumber) {
  return pdfDoc.getPage(pageNumber);
}
