import { useCallback, useRef, useEffect } from 'react';
import { clampCrop, hitTestHandle, isInsideCrop, resizeCrop, moveCrop } from '../utils/cropUtils';

/**
 * Interactive crop overlay with registration marks.
 * Draws a crop rectangle on top of the page canvas.
 */
export default function CropOverlay({
  pageWidth,
  pageHeight,
  crop,
  onCropChange,
  zoom,
  disabled = false,
}) {
  const svgRef = useRef(null);
  const stateRef = useRef({
    action: null,      // 'draw' | 'move' | 'resize'
    handle: null,       // resize handle name
    startMouse: { x: 0, y: 0 },
    startCrop: null,
  });

  // Convert screen coordinates to original page coordinates
  const toPageCoords = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    };
  }, [zoom]);

  const onMouseDown = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    const pt = toPageCoords(e.clientX, e.clientY);

    if (crop) {
      // Check if we're on a handle
      const handle = hitTestHandle(pt.x, pt.y, crop, 10 / zoom);
      if (handle) {
        stateRef.current = {
          action: 'resize',
          handle,
          startMouse: pt,
          startCrop: { ...crop },
        };
        return;
      }
      // Check if we're inside the crop
      if (isInsideCrop(pt.x, pt.y, crop)) {
        stateRef.current = {
          action: 'move',
          handle: null,
          startMouse: pt,
          startCrop: { ...crop },
        };
        return;
      }
    }

    // Start drawing a new crop
    stateRef.current = {
      action: 'draw',
      handle: null,
      startMouse: pt,
      startCrop: null,
    };
  }, [disabled, crop, zoom, toPageCoords]);

  const onMouseMove = useCallback((e) => {
    const state = stateRef.current;
    if (!state.action) {
      // Update cursor
      if (!crop || disabled) return;
      const pt = toPageCoords(e.clientX, e.clientY);
      const svg = svgRef.current;
      if (!svg) return;
      const handle = hitTestHandle(pt.x, pt.y, crop, 10 / zoom);
      if (handle) {
        svg.style.cursor = getResizeCursor(handle);
      } else if (isInsideCrop(pt.x, pt.y, crop)) {
        svg.style.cursor = 'move';
      } else {
        svg.style.cursor = 'crosshair';
      }
      return;
    }

    e.preventDefault();
    const pt = toPageCoords(e.clientX, e.clientY);

    if (state.action === 'draw') {
      const x = Math.min(state.startMouse.x, pt.x);
      const y = Math.min(state.startMouse.y, pt.y);
      const w = Math.abs(pt.x - state.startMouse.x);
      const h = Math.abs(pt.y - state.startMouse.y);
      const clamped = clampCrop({ x, y, w, h }, pageWidth, pageHeight);
      onCropChange(clamped);
    } else if (state.action === 'move') {
      const dx = pt.x - state.startMouse.x;
      const dy = pt.y - state.startMouse.y;
      const moved = moveCrop(state.startCrop, dx, dy, pageWidth, pageHeight);
      onCropChange(moved);
    } else if (state.action === 'resize') {
      const dx = pt.x - state.startMouse.x;
      const dy = pt.y - state.startMouse.y;
      const resized = resizeCrop(state.startCrop, state.handle, dx, dy, pageWidth, pageHeight);
      onCropChange(resized);
    }
  }, [crop, disabled, pageWidth, pageHeight, zoom, onCropChange, toPageCoords]);

  const onMouseUp = useCallback(() => {
    stateRef.current.action = null;
    stateRef.current.handle = null;
  }, []);

  const onClear = useCallback(() => {
    onCropChange(null);
  }, [onCropChange]);

  // Reset state when crop changes externally
  useEffect(() => {
    if (crop === null) {
      stateRef.current.startCrop = null;
    }
  }, [crop]);

  if (disabled) return null;

  const svgW = pageWidth * zoom;
  const svgH = pageHeight * zoom;

  // Scaled crop rectangle for display
  const dispCrop = crop ? {
    x: crop.x * zoom,
    y: crop.y * zoom,
    w: crop.w * zoom,
    h: crop.h * zoom,
  } : null;

  const regMarkSize = 12; // registration mark size in screen pixels

  return (
    <div className="crop-overlay" style={{ width: svgW, height: svgH }}>
      <svg
        ref={svgRef}
        className="crop-overlay__svg"
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Dimmed area outside crop */}
        {dispCrop && (
          <>
            <rect x={0} y={0} width={svgW} height={dispCrop.y} fill="rgba(0,0,0,0.25)" />
            <rect x={0} y={dispCrop.y + dispCrop.h} width={svgW} height={svgH - dispCrop.y - dispCrop.h} fill="rgba(0,0,0,0.25)" />
            <rect x={0} y={dispCrop.y} width={dispCrop.x} height={dispCrop.h} fill="rgba(0,0,0,0.25)" />
            <rect x={dispCrop.x + dispCrop.w} y={dispCrop.y} width={svgW - dispCrop.x - dispCrop.w} height={dispCrop.h} fill="rgba(0,0,0,0.25)" />
          </>
        )}

        {/* Crop rectangle */}
        {dispCrop && (
          <g className="crop-overlay__crop-group">
            {/* Dashed outline */}
            <rect
              x={dispCrop.x}
              y={dispCrop.y}
              width={dispCrop.w}
              height={dispCrop.h}
              fill="none"
              stroke="#0088C7"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />

            {/* Rule of thirds guides */}
            <line x1={dispCrop.x + dispCrop.w/3} y1={dispCrop.y} x2={dispCrop.x + dispCrop.w/3} y2={dispCrop.y + dispCrop.h} stroke="#0088C7" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4"/>
            <line x1={dispCrop.x + 2*dispCrop.w/3} y1={dispCrop.y} x2={dispCrop.x + 2*dispCrop.w/3} y2={dispCrop.y + dispCrop.h} stroke="#0088C7" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4"/>
            <line x1={dispCrop.x} y1={dispCrop.y + dispCrop.h/3} x2={dispCrop.x + dispCrop.w} y2={dispCrop.y + dispCrop.h/3} stroke="#0088C7" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4"/>
            <line x1={dispCrop.x} y1={dispCrop.y + 2*dispCrop.h/3} x2={dispCrop.x + dispCrop.w} y2={dispCrop.y + 2*dispCrop.h/3} stroke="#0088C7" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4"/>

            {/* Dimensions label */}
            <text
              x={dispCrop.x + dispCrop.w / 2}
              y={dispCrop.y - 6}
              textAnchor="middle"
              className="crop-overlay__dim-label"
              fill="#1A1A2E"
              fontSize="11"
              fontFamily="'JetBrains Mono', monospace"
            >
              {crop.w} × {crop.h} px
            </text>

            {/* Registration marks at corners */}
            {renderRegMark(dispCrop.x, dispCrop.y, regMarkSize)}
            {renderRegMark(dispCrop.x + dispCrop.w, dispCrop.y, regMarkSize)}
            {renderRegMark(dispCrop.x, dispCrop.y + dispCrop.h, regMarkSize)}
            {renderRegMark(dispCrop.x + dispCrop.w, dispCrop.y + dispCrop.h, regMarkSize)}

            {/* Resize handles */}
            {['nw', 'ne', 'sw', 'se'].map((h) => {
              const pos = handlePos(h, dispCrop);
              return (
                <rect
                  key={h}
                  x={pos.x - 6}
                  y={pos.y - 6}
                  width={12}
                  height={12}
                  fill="white"
                  stroke="#0088C7"
                  strokeWidth={1.5}
                  rx={2}
                  className="crop-overlay__handle"
                />
              );
            })}

            {/* Edge handles */}
            {['n', 's', 'e', 'w'].map((h) => {
              const pos = handlePos(h, dispCrop);
              const isH = h === 'n' || h === 's';
              return (
                <rect
                  key={h}
                  x={isH ? pos.x - 20 : pos.x - 3}
                  y={isH ? pos.y - 3 : pos.y - 20}
                  width={isH ? 40 : 6}
                  height={isH ? 6 : 40}
                  fill="white"
                  stroke="#0088C7"
                  strokeWidth={1}
                  rx={1}
                  className="crop-overlay__handle"
                />
              );
            })}
          </g>
        )}

        {/* Hint for empty state */}
        {!crop && (
          <text
            x={svgW / 2}
            y={svgH / 2}
            textAnchor="middle"
            className="crop-overlay__hint"
            fill="#6B6B6B"
            fontSize="14"
            fontFamily="'Atkinson Hyperlegible', sans-serif"
            pointerEvents="none"
          >
            Clicca e trascina per disegnare il ritaglio
          </text>
        )}
      </svg>

      {crop && (
        <button
          className="crop-overlay__clear-btn"
          onClick={onClear}
          aria-label="Rimuovi ritaglio"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 2l10 10M12 2L2 12"/>
          </svg>
          Rimuovi
        </button>
      )}
    </div>
  );
}

/** Render a single registration mark (circle + crosshair) */
function renderRegMark(cx, cy, size) {
  const inner = size * 0.4;
  const outer = size;
  return (
    <g key={`reg-${cx}-${cy}`}>
      {/* Outer circle (cyan) */}
      <circle cx={cx} cy={cy} r={outer} fill="none" stroke="#0088C7" strokeWidth="0.8" />
      {/* Inner circle (magenta) */}
      <circle cx={cx} cy={cy} r={inner} fill="none" stroke="#E83D4D" strokeWidth="0.8" />
      {/* Crosshair */}
      <line x1={cx - outer - 3} y1={cy} x2={cx - inner - 1} y2={cy} stroke="#1A1A2E" strokeWidth="0.8" />
      <line x1={cx + inner + 1} y1={cy} x2={cx + outer + 3} y2={cy} stroke="#1A1A2E" strokeWidth="0.8" />
      <line x1={cx} y1={cy - outer - 3} x2={cx} y2={cy - inner - 1} stroke="#1A1A2E" strokeWidth="0.8" />
      <line x1={cx} y1={cy + inner + 1} x2={cx} y2={cy + outer + 3} stroke="#1A1A2E" strokeWidth="0.8" />
    </g>
  );
}

function handlePos(handle, crop) {
  const { x, y, w, h } = crop;
  switch (handle) {
    case 'nw': return { x, y };
    case 'ne': return { x: x + w, y };
    case 'sw': return { x, y: y + h };
    case 'se': return { x: x + w, y: y + h };
    case 'n':  return { x: x + w / 2, y };
    case 's':  return { x: x + w / 2, y: y + h };
    case 'w':  return { x, y: y + h / 2 };
    case 'e':  return { x: x + w, y: y + h / 2 };
    default: return { x, y };
  }
}

function getResizeCursor(handle) {
  switch (handle) {
    case 'nw': case 'se': return 'nwse-resize';
    case 'ne': case 'sw': return 'nesw-resize';
    case 'n': case 's': return 'ns-resize';
    case 'e': case 'w': return 'ew-resize';
    default: return 'default';
  }
}
