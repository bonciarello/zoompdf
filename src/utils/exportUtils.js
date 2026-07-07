import JSZip from 'jszip';

/**
 * Crop a canvas to a given rectangle and return a new canvas.
 * The crop rectangle is in original page coordinates.
 *
 * @param {HTMLCanvasElement} sourceCanvas - The full page canvas
 * @param {{x: number, y: number, w: number, h: number}} crop - Crop area in original coords
 * @returns {HTMLCanvasElement} Cropped canvas
 */
export function cropCanvas(sourceCanvas, crop) {
  const out = document.createElement('canvas');
  out.width = crop.w;
  out.height = crop.h;
  const ctx = out.getContext('2d');

  ctx.drawImage(
    sourceCanvas,
    crop.x, crop.y, crop.w, crop.h,
    0, 0, crop.w, crop.h
  );

  return out;
}

/**
 * Convert a canvas to a downloadable PNG Blob.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}

/**
 * Trigger a download of a blob as a file.
 *
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download a single cropped page as PNG.
 *
 * @param {HTMLCanvasElement} pageCanvas
 * @param {{x: number, y: number, w: number, h: number}} crop
 * @param {string} filename
 * @returns {Promise<void>}
 */
export async function downloadCroppedPage(pageCanvas, crop, filename) {
  const cropped = cropCanvas(pageCanvas, crop);
  const blob = await canvasToBlob(cropped);
  downloadBlob(blob, filename || 'pagina-ritagliata.png');
}

/**
 * Create a ZIP archive containing multiple cropped page images.
 *
 * @param {Array<{canvas: HTMLCanvasElement, crop: {x:number,y:number,w:number,h:number}, filename: string}>} items
 * @returns {Promise<Blob>}
 */
export async function createZip(items) {
  const zip = new JSZip();

  for (const item of items) {
    const cropped = cropCanvas(item.canvas, item.crop);
    const blob = await canvasToBlob(cropped);
    zip.file(item.filename, blob);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Download a ZIP archive of all cropped pages.
 *
 * @param {Array<{canvas: HTMLCanvasElement, crop: {x:number,y:number,w:number,h:number}, filename: string}>} items
 * @returns {Promise<void>}
 */
export async function downloadBatchZip(items) {
  const zipBlob = await createZip(items);
  downloadBlob(zipBlob, 'pagine-ritagliate.zip');
}
