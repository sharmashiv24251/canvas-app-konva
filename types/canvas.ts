// src/types/canvas.ts
export type ElementType = "rect" | "circle" | "image" | "arrow" | "text" | "ring";

export type BaseEl = {
  id: string;
  type: ElementType;
  rotation: number;
  name?: string;        // for sidebar display
};

export type RectEl = BaseEl & {
  type: "rect";
  x: number; y: number; width: number; height: number; fill: string;
};

export type CircleEl = BaseEl & {
  type: "circle";
  cx: number; cy: number; radius: number; fill: string;
};

export type ImageEl = BaseEl & {
  type: "image";
  x: number; y: number; width: number; height: number; src: string;
};

export type ArrowEl = BaseEl & {
    type: "arrow";
    x: number;
    y: number;
    points: [number, number, number, number];
    stroke: string;
    strokeWidth: number;
  };

export type TextEl = BaseEl & {
  type: "text";
  x: number; y: number; text: string; fontSize: number; fill: string;
};

export type RingEl = BaseEl & {
  type: "ring";
  cx: number; cy: number; innerRadius: number; outerRadius: number; fill: string;
};

export type AnyEl = RectEl | CircleEl | ImageEl | ArrowEl | TextEl | RingEl;

export type CanvasState = {
  elements: AnyEl[];         // draw order = z-index (last is on top)
  selectedId: string | null;
  // simple history for undo/redo
  past: Omit<CanvasState, "past"|"future">[];
  future: Omit<CanvasState, "past"|"future">[];
};
