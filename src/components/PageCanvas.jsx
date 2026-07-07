import { useEffect, useRef, useState, useCallback } from 'react';
import { getPage, renderPage } from '../utils/pdfUtils';
import CropOverlay from './CropOverlay';
import { downloadCroppedPage } from '../utils/exportUtils';

export default function PageCanvas({
  pdfDoc,
  pageIndex,
  zoom,
  crop,
  onCropChange,
  isRendering,
  onRenderComplete,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [pageDims, setPageDims] = useState(null);
  const [renderError, setRenderError] = useState(null);
  const [renderedZoom, setRenderedZoom] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const pageNum = pageIndex + 1;

  // Render the page
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !pdfDoc) return;

    async function render() {
      try {
        setRenderError(null);
        const page = await getPage(pdfDoc, pageNum);
        if (cancelled) return;

        const [origWidth, origHeight] = [
          page.getViewport({ scale: 1 }).width,
          page.getViewport({ scale: 1 }).height,
        ];

        // Only re-render if zoom changed significantly
        if (renderedZoom !== zoom) {
          const result = await renderPage(page, zoom, canvas);
          if (cancelled) return;
          setRenderedZoom(zoom);
          setPageDims({ width: origWidth, height: origHeight });
        } else {
          // Still need page dims if not set
          if (!pageDims) {
            setPageDims({ width: origWidth, height: origHeight });
          }
        }

        if (!cancelled && onRenderComplete) {
          onRenderComplete(pageIndex);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Render error:', err);
          setRenderError('Errore nel rendering della pagina');
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, zoom]);

  const handleDownload = useCallback(async () => {
    if (!crop || !canvasRef.current) return;
    setIsDownloading(true);
    try {
      await downloadCroppedPage(
        canvasRef.current,
        crop,
        `pagina-${pageNum}-ritaglio.png`
      );
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [crop, pageNum]);

  const displayWidth = pageDims ? pageDims.width * zoom : 0;
  const displayHeight = pageDims ? pageDims.height * zoom : 0;

  return (
    <div className={`page-canvas ${isRendering && !pageDims ? 'page-canvas--loading' : ''}`}>
      <div className="page-canvas__header">
        <span className="page-canvas__number">
          Pagina {pageNum}
        </span>
        {pageDims && (
          <span className="page-canvas__dims">
            {Math.round(pageDims.width)} × {Math.round(pageDims.height)} px
          </span>
        )}
        {crop && (
          <button
            className="page-canvas__download-btn"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label={`Scarica il ritaglio della pagina ${pageNum} come PNG`}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1v8.5M3.5 6L7 9.5 10.5 6"/>
              <path d="M1 11.5h12v2.5H1z"/>
            </svg>
            {isDownloading ? 'Scaricando…' : 'Scarica PNG'}
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="page-canvas__viewport"
        style={{
          width: displayWidth || 'auto',
          height: displayHeight || 'auto',
        }}
      >
        <canvas
          ref={canvasRef}
          className="page-canvas__canvas"
        />

        {pageDims && !renderError && (
          <CropOverlay
            pageWidth={pageDims.width}
            pageHeight={pageDims.height}
            crop={crop}
            onCropChange={onCropChange}
            zoom={zoom}
            disabled={isRendering}
          />
        )}

        {isRendering && !pageDims && (
          <div className="page-canvas__loading">
            <div className="page-canvas__spinner" />
            <span>Rendering pagina {pageNum}…</span>
          </div>
        )}

        {renderError && (
          <div className="page-canvas__error" role="alert">
            {renderError}
          </div>
        )}
      </div>
    </div>
  );
}
