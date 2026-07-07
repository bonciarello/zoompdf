import ZoomControl from './ZoomControl';

export default function Toolbar({
  pdfName,
  pageCount,
  zoom,
  onZoomChange,
  onReset,
  hasCrops,
  onClearAllCrops,
}) {
  return (
    <header className="toolbar" role="banner">
      <div className="toolbar__left">
        <h1 className="toolbar__title">
          <span className="toolbar__brand">PressCheck</span>
          <span className="toolbar__sep" aria-hidden="true">/</span>
          <span className="toolbar__doc-name">{pdfName}</span>
        </h1>
        {pageCount > 0 && (
          <span className="toolbar__meta">
            {pageCount} pagina{pageCount !== 1 ? 'e' : ''}
          </span>
        )}
      </div>

      <div className="toolbar__center">
        <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
      </div>

      <div className="toolbar__right">
        {hasCrops && (
          <button
            className="toolbar__btn toolbar__btn--secondary"
            onClick={onClearAllCrops}
            type="button"
            aria-label="Rimuovi tutti i ritagli"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12"/>
            </svg>
            Pulisci ritagli
          </button>
        )}
        <button
          className="toolbar__btn toolbar__btn--secondary"
          onClick={onReset}
          type="button"
          aria-label="Carica un nuovo PDF"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M1 7h12M7 1v12"/>
          </svg>
          Nuovo PDF
        </button>
      </div>
    </header>
  );
}
