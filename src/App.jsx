import { useState, useCallback, useRef } from 'react';
import DropZone from './components/DropZone';
import Toolbar from './components/Toolbar';
import PageGrid from './components/PageGrid';
import ExportPanel from './components/ExportPanel';
import { loadPdf, getPageCount, renderPage, getPage } from './utils/pdfUtils';

export default function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1.5);
  const [crops, setCrops] = useState(new Map());
  const [pageCanvases, setPageCanvases] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const canvasCacheRef = useRef(new Map());

  const handleFileLoaded = useCallback(async (file) => {
    setLoading(true);
    setLoadError('');
    setPdfFile(file);
    setPdfName(file.name);
    setCrops(new Map());
    setPageCanvases(new Map());
    canvasCacheRef.current.clear();

    try {
      const doc = await loadPdf(file);
      setPdfDoc(doc);
      setPageCount(getPageCount(doc));
    } catch (err) {
      console.error('PDF load error:', err);
      setLoadError('Impossibile caricare il PDF. Verifica che il file non sia danneggiato o protetto da password.');
      setPdfDoc(null);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCropChange = useCallback((pageIndex, crop) => {
    setCrops((prev) => {
      const next = new Map(prev);
      if (crop === null) {
        next.delete(pageIndex);
      } else {
        next.set(pageIndex, crop);
      }
      return next;
    });

    // Track canvas for export (async)
    if (pdfDoc && crop) {
      getPage(pdfDoc, pageIndex + 1).then(async (page) => {
        const result = await renderPage(page, zoom);
        setPageCanvases((prev) => {
          const next = new Map(prev);
          next.set(pageIndex, result.canvas);
          return next;
        });
      }).catch(() => {});
    }
  }, [pdfDoc, zoom]);

  const handleClearAllCrops = useCallback(() => {
    setCrops(new Map());
  }, []);

  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPdfName('');
    setPdfDoc(null);
    setPageCount(0);
    setCrops(new Map());
    setPageCanvases(new Map());
    canvasCacheRef.current.clear();
    setLoadError('');
  }, []);

  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const hasCrops = crops.size > 0;

  return (
    <div className="app">
      {!pdfDoc ? (
        <main className="app__upload-view">
          <div className="app__hero">
            <div className="app__logo" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" stroke="#0088C7" strokeWidth="2.5" fill="none"/>
                <circle cx="32" cy="32" r="4" fill="#E83D4D"/>
                <line x1="32" y1="6" x2="32" y2="20" stroke="#1A1A2E" strokeWidth="2"/>
                <line x1="32" y1="44" x2="32" y2="58" stroke="#1A1A2E" strokeWidth="2"/>
                <line x1="6" y1="32" x2="20" y2="32" stroke="#1A1A2E" strokeWidth="2"/>
                <line x1="44" y1="32" x2="58" y2="32" stroke="#1A1A2E" strokeWidth="2"/>
                <rect x="12" y="12" width="40" height="40" rx="2" stroke="#FFB800" strokeWidth="1.5" strokeDasharray="4 4"/>
              </svg>
            </div>
            <h1 className="app__title">
              Converti PDF in PNG
              <span className="app__subtitle">Zoom e ritaglio di precisione per ogni pagina</span>
            </h1>
            <p className="app__desc">
              Carica un documento PDF, regola lo zoom per inquadrare l&rsquo;area che ti interessa,
              disegna un rettangolo di ritaglio e scarica la porzione come immagine PNG &mdash;
              una pagina alla volta o tutte insieme in un archivio ZIP.
            </p>
          </div>
          <DropZone onFileLoaded={handleFileLoaded} />
          {loading && (
            <div className="app__loading" role="status">
              <div className="app__spinner" />
              Caricamento del PDF in corso…
            </div>
          )}
          {loadError && (
            <div className="app__error" role="alert">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 5.5v4M9 12.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {loadError}
            </div>
          )}
        </main>
      ) : (
        <>
          <Toolbar
            pdfName={pdfName}
            pageCount={pageCount}
            zoom={zoom}
            onZoomChange={handleZoomChange}
            onReset={handleReset}
            hasCrops={hasCrops}
            onClearAllCrops={handleClearAllCrops}
          />
          <main className="app__workspace">
            <PageGrid
              pdfDoc={pdfDoc}
              zoom={zoom}
              pageCount={pageCount}
              crops={crops}
              onCropChange={handleCropChange}
            />
            <ExportPanel
              crops={crops}
              pageCanvases={pageCanvases}
              pdfDoc={pdfDoc}
              zoom={zoom}
            />
          </main>
        </>
      )}

      <footer className="app__footer">
        <p>Tutti i dati restano sul tuo dispositivo — nessun file viene caricato su server esterni.</p>
      </footer>
    </div>
  );
}
