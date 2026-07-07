import { useCallback, useMemo } from 'react';
import { downloadBatchZip } from '../utils/exportUtils';

export default function ExportPanel({
  crops,
  pageCanvases,
  pdfDoc,
  zoom,
  pages,
}) {
  // Collect all pages that have a crop and a rendered canvas
  const exportableItems = useMemo(() => {
    if (!pageCanvases) return [];
    const items = [];
    for (const [pageIndex, crop] of crops.entries()) {
      const canvas = pageCanvases.get(pageIndex);
      if (canvas && crop) {
        items.push({
          canvas,
          crop,
          filename: `pagina-${pageIndex + 1}-ritaglio.png`,
          pageIndex,
        });
      }
    }
    return items;
  }, [crops, pageCanvases]);

  const hasAnyCrop = crops.size > 0;

  const handleBatchDownload = useCallback(async () => {
    if (exportableItems.length === 0) return;
    try {
      await downloadBatchZip(exportableItems);
    } catch (err) {
      console.error('Batch download error:', err);
    }
  }, [exportableItems]);

  if (!hasAnyCrop) return null;

  return (
    <div className="export-panel" role="region" aria-label="Pannello di esportazione">
      <div className="export-panel__summary">
        <span className="export-panel__count">
          {exportableItems.length} pagina{exportableItems.length !== 1 ? 'e' : ''} pronte per l&rsquo;esportazione
        </span>
      </div>
      <button
        className="export-panel__btn export-panel__btn--batch"
        onClick={handleBatchDownload}
        disabled={exportableItems.length === 0}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v9M3.5 7L8 11.5 12.5 7"/>
          <rect x="1" y="12.5" width="14" height="3.5" rx="1"/>
        </svg>
        Scarica tutto come ZIP
      </button>
    </div>
  );
}
