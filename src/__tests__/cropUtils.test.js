import { describe, it, expect } from 'vitest';
import { clampCrop, hitTestHandle, isInsideCrop, resizeCrop, moveCrop } from '../utils/cropUtils';

describe('clampCrop', () => {
  it('dovrebbe normalizzare dimensioni negative', () => {
    const result = clampCrop({ x: 50, y: 50, w: -30, h: -20 }, 100, 100);
    expect(result.x).toBe(20);
    expect(result.y).toBe(30);
    expect(result.w).toBe(30);
    expect(result.h).toBe(20);
  });

  it('dovrebbe clampare ai bordi della pagina', () => {
    const result = clampCrop({ x: -10, y: -5, w: 50, h: 40 }, 100, 100);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.w).toBe(40);
    expect(result.h).toBe(35);
  });

  it('dovrebbe limitare larghezza e altezza alla pagina', () => {
    const result = clampCrop({ x: 80, y: 80, w: 50, h: 50 }, 100, 100);
    expect(result.x).toBe(80);
    expect(result.y).toBe(80);
    expect(result.w).toBe(20);
    expect(result.h).toBe(20);
  });

  it('dovrebbe rispettare la dimensione minima', () => {
    const result = clampCrop({ x: 10, y: 10, w: 2, h: 2 }, 100, 100, 10);
    expect(result.w).toBe(10);
    expect(result.h).toBe(10);
  });

  it('dovrebbe arrotondare i valori', () => {
    const result = clampCrop({ x: 10.7, y: 20.3, w: 30.5, h: 40.1 }, 100, 100);
    expect(result.x).toBe(11);
    expect(result.y).toBe(20);
    expect(result.w).toBe(31);
    expect(result.h).toBe(40);
  });
});

describe('hitTestHandle', () => {
  const crop = { x: 20, y: 20, w: 60, h: 40 };

  it('dovrebbe rilevare il corner NW', () => {
    expect(hitTestHandle(20, 20, crop)).toBe('nw');
  });

  it('dovrebbe rilevare il corner SE', () => {
    expect(hitTestHandle(80, 60, crop)).toBe('se');
  });

  it('dovrebbe rilevare il lato N', () => {
    expect(hitTestHandle(50, 20, crop)).toBe('n');
  });

  it('dovrebbe rilevare il lato E', () => {
    expect(hitTestHandle(80, 40, crop)).toBe('e');
  });

  it('dovrebbe restituire null per un punto fuori', () => {
    expect(hitTestHandle(10, 10, crop)).toBeNull();
  });

  it('dovrebbe restituire null per un punto interno lontano dai bordi', () => {
    expect(hitTestHandle(50, 40, crop)).toBeNull();
  });

  it('dovrebbe funzionare con handleSize personalizzato', () => {
    // handleSize=2: point (21, 20) is 1px from NW corner → should hit NW
    expect(hitTestHandle(21, 20, crop, 2)).toBe('nw');
    // handleSize=2: point (24, 20) is 4px from NW corner → should NOT hit NW,
    // but is on the N edge (|y-20|=0 <= 1, and x=24 > 20+2=22)
    expect(hitTestHandle(24, 20, crop, 2)).toBe('n');
  });
});

describe('isInsideCrop', () => {
  const crop = { x: 10, y: 10, w: 50, h: 30 };

  it('dovrebbe riconoscere un punto interno', () => {
    expect(isInsideCrop(30, 20, crop)).toBe(true);
  });

  it('dovrebbe riconoscere il bordo', () => {
    expect(isInsideCrop(10, 10, crop)).toBe(true);
    expect(isInsideCrop(60, 40, crop)).toBe(true);
  });

  it('dovrebbe riconoscere un punto esterno', () => {
    expect(isInsideCrop(5, 5, crop)).toBe(false);
    expect(isInsideCrop(70, 20, crop)).toBe(false);
  });
});

describe('resizeCrop', () => {
  const pageW = 200, pageH = 200;
  const crop = { x: 40, y: 40, w: 80, h: 60 };

  it('dovrebbe ridimensionare da SE', () => {
    const result = resizeCrop(crop, 'se', 20, 20, pageW, pageH);
    expect(result.w).toBe(100);
    expect(result.h).toBe(80);
  });

  it('dovrebbe ridimensionare da NW', () => {
    const result = resizeCrop(crop, 'nw', 10, 10, pageW, pageH);
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.w).toBe(70);
    expect(result.h).toBe(50);
  });

  it('dovrebbe ridimensionare da N (solo altezza)', () => {
    const result = resizeCrop(crop, 'n', 0, 10, pageW, pageH);
    expect(result.y).toBe(50);
    expect(result.h).toBe(50);
    expect(result.w).toBe(80);
  });

  it('dovrebbe ridimensionare da E (solo larghezza)', () => {
    const result = resizeCrop(crop, 'e', -20, 0, pageW, pageH);
    expect(result.w).toBe(60);
    expect(result.h).toBe(60);
  });

  it('dovrebbe restituire il crop invariato per handle sconosciuto', () => {
    const result = resizeCrop(crop, 'xyz', 10, 10, pageW, pageH);
    expect(result).toEqual(crop);
  });
});

describe('moveCrop', () => {
  const pageW = 100, pageH = 100;
  const crop = { x: 20, y: 20, w: 30, h: 20 };

  it('dovrebbe muovere il crop', () => {
    const result = moveCrop(crop, 10, 5, pageW, pageH);
    expect(result.x).toBe(30);
    expect(result.y).toBe(25);
  });

  it('dovrebbe clampare ai bordi', () => {
    const result = moveCrop(crop, -30, -30, pageW, pageH);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('dovrebbe clampare al bordo destro', () => {
    const result = moveCrop(crop, 80, 0, pageW, pageH);
    expect(result.x).toBe(70); // 100 - 30
  });

  it('non dovrebbe cambiare dimensioni', () => {
    const result = moveCrop(crop, 5, 5, pageW, pageH);
    expect(result.w).toBe(30);
    expect(result.h).toBe(20);
  });
});
