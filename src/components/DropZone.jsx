import { useCallback, useRef, useState } from 'react';

export default function DropZone({ onFileLoaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    setError('');
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Il file deve essere un PDF. Riprova con un documento .pdf.');
      return;
    }
    onFileLoaded(file);
  }, [onFileLoaded]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onInputChange = useCallback((e) => {
    handleFile(e.target.files[0]);
  }, [handleFile]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  return (
    <div className="dropzone-wrapper">
      <div
        className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Carica un file PDF — clicca o trascina qui"
      >
        <div className="dropzone__icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 8v18M12 18l8 8 8-8" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="6" y="26" width="28" height="8" rx="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="dropzone__label">
          Trascina qui il tuo PDF &mdash; o <span className="dropzone__link">clicca per sfogliare</span>
        </p>
        <p className="dropzone__hint">Accetta file PDF di qualsiasi dimensione</p>
      </div>

      {error && (
        <div className="dropzone__error" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v4M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onInputChange}
        className="dropzone__input"
        aria-hidden="true"
      />
    </div>
  );
}
