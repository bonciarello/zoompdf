export default function ZoomControl({ zoom, onZoomChange, min = 0.25, max = 4, step = 0.25 }) {
  const presets = [0.5, 0.75, 1, 1.5, 2, 3];

  return (
    <div className="zoom-control" role="group" aria-label="Controllo zoom">
      <button
        className="zoom-control__btn"
        onClick={() => onZoomChange(Math.max(min, zoom - step))}
        disabled={zoom <= min}
        aria-label="Riduci zoom"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="7.5" cy="7.5" r="5.5"/>
          <path d="M11.5 11.5L16 16M4.5 7.5h6"/>
        </svg>
      </button>

      <div className="zoom-control__slider-wrapper">
        <input
          type="range"
          className="zoom-control__slider"
          min={min * 100}
          max={max * 100}
          step={step * 100}
          value={zoom * 100}
          onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
          aria-label={`Zoom: ${Math.round(zoom * 100)}%`}
        />
      </div>

      <button
        className="zoom-control__btn"
        onClick={() => onZoomChange(Math.min(max, zoom + step))}
        disabled={zoom >= max}
        aria-label="Aumenta zoom"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="7.5" cy="7.5" r="5.5"/>
          <path d="M11.5 11.5L16 16M4.5 7.5h6M7.5 4.5v6"/>
        </svg>
      </button>

      <span className="zoom-control__value" aria-live="polite">
        {Math.round(zoom * 100)}%
      </span>

      <div className="zoom-control__presets">
        {presets.map((p) => (
          <button
            key={p}
            className={`zoom-control__preset ${zoom === p ? 'zoom-control__preset--active' : ''}`}
            onClick={() => onZoomChange(p)}
          >
            {p * 100}%
          </button>
        ))}
      </div>
    </div>
  );
}
