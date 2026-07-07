import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBlob, cropCanvas } from '../utils/exportUtils';

describe('downloadBlob', () => {
  beforeEach(() => {
    // Mock URL and anchor
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dovrebbe creare e cliccare un anchor per il download', () => {
    const clickSpy = vi.fn();
    const appendSpy = vi.fn();
    const removeSpy = vi.fn();

    // Mock createElement to return a fake anchor
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    vi.spyOn(document.body, 'appendChild').mockImplementation(appendSpy);
    vi.spyOn(document.body, 'removeChild').mockImplementation(removeSpy);

    const blob = new Blob(['test'], { type: 'image/png' });
    downloadBlob(blob, 'test.png');

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});

describe('cropCanvas', () => {
  it('dovrebbe creare un canvas delle dimensioni del crop', () => {
    // Create a mock source canvas
    const sourceCanvas = {
      width: 100,
      height: 80,
      getContext: () => ({
        drawImage: vi.fn(),
      }),
    };

    const crop = { x: 20, y: 10, w: 50, h: 40 };

    // Mock document.createElement for the output canvas
    const origCreateElement = document.createElement.bind(document);
    const createdCanvases = [];
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreateElement(tag);
      if (tag === 'canvas') {
        el.getContext = () => ({ drawImage: vi.fn() });
        createdCanvases.push(el);
      }
      return el;
    });

    const result = cropCanvas(sourceCanvas, crop);

    expect(result.width).toBe(50);
    expect(result.height).toBe(40);
  });
});
