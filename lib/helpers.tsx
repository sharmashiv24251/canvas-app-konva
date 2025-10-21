// clamp a number to min/max
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

// center of stage — useful everywhere
export const getStageCenter = (stageWidth: number, stageHeight: number) => ({
  x: stageWidth / 2,
  y: stageHeight / 2,
});

// for arrow elements — calculate bounding box width/height from 2 points
export const arrowBBoxFromPoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => ({
  width: Math.abs(x2 - x1),
  height: Math.abs(y2 - y1),
});

// offset helper (commonly used for positioning, e.g., +16px)
export const offsetBy = (value: number, amount = 16) => value + amount;

// distance between 2 points — useful for arrows, length calc
export const distance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.hypot(x2 - x1, y2 - y1);

// simple, prefix-based unique ID gen for canvas elements
export const newId = () => "el_" + Math.random().toString(36).slice(2, 9);

// load image dimensions before placing on canvas
export function loadImageSize(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

// safe getter for width/height from a Konva node ref
export const getNodeSize = (node: any) => ({
  width: node?.width?.() ?? 0,
  height: node?.height?.() ?? 0,
});
