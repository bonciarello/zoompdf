import { useState, useCallback } from 'react';
import PageCanvas from './PageCanvas';

export default function PageGrid({
  pdfDoc,
  zoom,
  pageCount,
  crops,
  onCropChange,
}) {
  const [renderedPages, setRenderedPages] = useState(new Set());

  const handleRenderComplete = useCallback((pageIndex) => {
    setRenderedPages((prev) => {
      const next = new Set(prev);
      next.add(pageIndex);
      return next;
    });
  }, []);

  const pages = Array.from({ length: pageCount }, (_, i) => i);

  return (
    <div className="page-grid">
      <div className="page-grid__info" role="status">
        <span>
          {renderedPages.size} di {pageCount} pagine renderizzate
        </span>
      </div>
      <div className="page-grid__list">
        {pages.map((pageIndex) => (
          <PageCanvas
            key={pageIndex}
            pdfDoc={pdfDoc}
            pageIndex={pageIndex}
            zoom={zoom}
            crop={crops.get(pageIndex) || null}
            onCropChange={(c) => onCropChange(pageIndex, c)}
            isRendering={!renderedPages.has(pageIndex)}
            onRenderComplete={handleRenderComplete}
          />
        ))}
      </div>
    </div>
  );
}
