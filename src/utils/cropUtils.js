/**
 * Create a new crop rectangle at the given position.
 * Ensures the rectangle stays within the page bounds.
 *
 * @param {{x: number, y: number, w: number, h: number}} rect - Proposed crop rectangle
 * @param {number} pageWidth - Page width in original coordinates
 * @param {number} pageHeight - Page height in original coordinates
 * @param {number} minSize - Minimum crop size in pixels
 * @returns {{x: number, y: number, w: number, h: number}} Clamped crop rectangle
 */
export function clampCrop(rect, pageWidth, pageHeight, minSize = 10) {
  let { x, y, w, h } = rect;

  // Ensure positive dimensions
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }

  // Enforce minimum size
  w = Math.max(w, minSize);
  h = Math.max(h, minSize);

  // Clamp to page bounds
  if (x < 0) { w += x; x = 0; }
  if (y < 0) { h += y; y = 0; }
  if (x + w > pageWidth) w = pageWidth - x;
  if (y + h > pageHeight) h = pageHeight - y;

  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

/**
 * Check if a point is inside a crop rectangle's resize handle.
 * Handles are at corners and edge midpoints.
 *
 * @param {number} mx - Mouse X in original page coordinates
 * @param {number} my - Mouse Y in original page coordinates
 * @param {{x: number, y: number, w: number, h: number}} crop
 * @param {number} handleSize - Size of handle in original coordinates
 * @returns {string|null} Handle name or null
 */
export function hitTestHandle(mx, my, crop, handleSize = 8) {
  const { x, y, w, h } = crop;
  const hs = handleSize;
  const hhs = hs / 2;

  // Corners first (they take priority)
  if (Math.abs(mx - x) <= hhs && Math.abs(my - y) <= hhs) return 'nw';
  if (Math.abs(mx - (x + w)) <= hhs && Math.abs(my - y) <= hhs) return 'ne';
  if (Math.abs(mx - x) <= hhs && Math.abs(my - (y + h)) <= hhs) return 'sw';
  if (Math.abs(mx - (x + w)) <= hhs && Math.abs(my - (y + h)) <= hhs) return 'se';

  // Edges
  if (Math.abs(my - y) <= hhs && mx > x + hs && mx < x + w - hs) return 'n';
  if (Math.abs(my - (y + h)) <= hhs && mx > x + hs && mx < x + w - hs) return 's';
  if (Math.abs(mx - x) <= hhs && my > y + hs && my < y + h - hs) return 'w';
  if (Math.abs(mx - (x + w)) <= hhs && my > y + hs && my < y + h - hs) return 'e';

  return null;
}

/**
 * Check if a point is inside the crop rectangle.
 *
 * @param {number} mx
 * @param {number} my
 * @param {{x: number, y: number, w: number, h: number}} crop
 * @returns {boolean}
 */
export function isInsideCrop(mx, my, crop) {
  return mx >= crop.x && mx <= crop.x + crop.w && my >= crop.y && my <= crop.y + crop.h;
}

/**
 * Resize the crop rectangle from a given handle.
 *
 * @param {{x: number, y: number, w: number, h: number}} crop - Original crop
 * @param {string} handle - Handle being dragged
 * @param {number} dx - Delta X in original coordinates
 * @param {number} dy - Delta Y in original coordinates
 * @param {number} pageWidth
 * @param {number} pageHeight
 * @param {number} minSize
 * @returns {{x: number, y: number, w: number, h: number}}
 */
export function resizeCrop(crop, handle, dx, dy, pageWidth, pageHeight, minSize = 10) {
  let { x, y, w, h } = crop;

  switch (handle) {
    case 'nw': x += dx; y += dy; w -= dx; h -= dy; break;
    case 'ne': y += dy; w += dx; h -= dy; break;
    case 'sw': x += dx; w -= dx; h += dy; break;
    case 'se': w += dx; h += dy; break;
    case 'n':  y += dy; h -= dy; break;
    case 's':  h += dy; break;
    case 'w':  x += dx; w -= dx; break;
    case 'e':  w += dx; break;
    default: return crop;
  }

  return clampCrop({ x, y, w, h }, pageWidth, pageHeight, minSize);
}

/**
 * Move the crop rectangle by delta.
 *
 * @param {{x: number, y: number, w: number, h: number}} crop
 * @param {number} dx
 * @param {number} dy
 * @param {number} pageWidth
 * @param {number} pageHeight
 * @returns {{x: number, y: number, w: number, h: number}}
 */
export function moveCrop(crop, dx, dy, pageWidth, pageHeight) {
  let x = crop.x + dx;
  let y = crop.y + dy;
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + crop.w > pageWidth) x = pageWidth - crop.w;
  if (y + crop.h > pageHeight) y = pageHeight - crop.h;
  return { ...crop, x: Math.round(x), y: Math.round(y) };
}
