"use client";

import { useMemo, useRef } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  select as selectAction,
  updateElement,
  removeElement,
  moveElementToIndex,
  addElement,
  undo as undoAction,
  redo as redoAction,
} from "@/store/canvasSlice";

import type { RootState } from "@/store";
import type {
  AnyEl,
  RectEl,
  CircleEl,
  ImageEl,
  TextEl,
  ArrowEl,
  RingEl,
} from "@/types/canvas";

import { clamp, arrowBBoxFromPoints } from "@/lib/helpers";

import { STAGE_HEIGHT } from "@/constants/canvas";
// import { TRANSFORMER_STYLE } from "@/constants/ui"; // (unused here)
import {
  RECT_MIN,
  IMAGE_MIN,
  TEXT_MIN,
  CIRCLE_MIN,
  RING_MIN,
  ARROW_MIN,
  RECT_DEFAULTS,
  IMAGE_DEFAULTS,
  TEXT_DEFAULTS,
  CIRCLE_DEFAULTS,
  RING_DEFAULTS,
  ARROW_DEFAULTS,
} from "@/constants/elements";
import { CANVAS_SHELL_ID } from "@/constants/dom";

// ---------- selectors (stable references)
const sel = createSelector(
  (s: RootState) => s.canvas.elements,
  (s: RootState) => s.canvas.selectedId,
  (s: RootState) => s.canvas.past.length,
  (s: RootState) => s.canvas.future.length,
  (elements, selectedId, pastLen, futureLen) => ({
    elements,
    selectedId,
    canUndo: pastLen > 0,
    canRedo: futureLen > 0,
  })
);

type UseCanvasArgs = {
  /** Current stage width (from useStageSize). Required for bounds. */
  stageWidth: number;
};

export function useCanvas({ stageWidth }: UseCanvasArgs) {
  const dispatch = useAppDispatch();
  const { elements, selectedId, canUndo, canRedo } = useAppSelector(sel);

  // keep Konva node refs here so Transformer can attach without Redux
  const nodeRefs = useRef<Record<string, any>>({});

  // selected element (convenience)
  const selected = useMemo<AnyEl | null>(() => {
    if (!selectedId) return null;
    return elements.find((e) => e.id === selectedId) ?? null;
  }, [elements, selectedId]);

  // Display list "topmost first" (for Sidebar)
  const elementsTopFirst = useMemo(
    () =>
      [...elements]
        .map((el, idx) => ({ el, arrayIndex: idx }))
        .reverse(),
    [elements]
  );

  // ---------- selection
  const selectById = (id: string | null) => dispatch(selectAction(id));
  const clearSelection = () => dispatch(selectAction(null));

  // ---------- CRUD
  const add = (el: Partial<AnyEl>) => dispatch(addElement(el));
  const update = (id: string, patch: Partial<AnyEl>) =>
    dispatch(updateElement({ id, patch }));
  const remove = (id: string) => dispatch(removeElement(id));

  // ---------- history
  const undo = () => dispatch(undoAction());
  const redo = () => dispatch(redoAction());

  // ---------- reorder
  const moveToIndex = (id: string, to: number) =>
    dispatch(moveElementToIndex({ id, to }));

  const moveSelectedUp = () => {
    if (!selectedId) return;
    const from = elements.findIndex((e) => e.id === selectedId);
    if (from < 0) return;
    const to = Math.min(elements.length - 1, from + 1); // higher index = on top
    if (to !== from) dispatch(moveElementToIndex({ id: selectedId, to }));
  };

  const moveSelectedDown = () => {
    if (!selectedId) return;
    const from = elements.findIndex((e) => e.id === selectedId);
    if (from < 0) return;
    const to = Math.max(0, from - 1);
    if (to !== from) dispatch(moveElementToIndex({ id: selectedId, to }));
  };

  // ---------- helpers
  const getCenter = () => {
    const shell =
      typeof document !== "undefined"
        ? document.getElementById(CANVAS_SHELL_ID)
        : null;
    const width =
      (shell?.clientWidth ??
        (typeof window !== "undefined" ? window.innerWidth : undefined)) ?? 0;
    return { cx: Math.round(width / 2), cy: Math.round(STAGE_HEIGHT / 2) };
  };

  // ---------- built-in adders (centered)
  const addRectangle = (opts?: Partial<RectEl>) => {
    const { cx, cy } = getCenter();
    const w = opts?.width ?? RECT_DEFAULTS.width;
    const h = opts?.height ?? RECT_DEFAULTS.height;
    add({
      type: "rect",
      x: Math.round(cx - w / 2),
      y: Math.round(cy - h / 2),
      width: w,
      height: h,
      cornerRadius: opts?.cornerRadius ?? RECT_DEFAULTS.cornerRadius,
      fill: opts?.fill ?? RECT_DEFAULTS.fill,
      rotation: opts?.rotation ?? 0,
      name: opts?.name ?? "Rectangle",
    } as Partial<RectEl>);
  };

  const addCircle = (opts?: Partial<CircleEl>) => {
    const { cx, cy } = getCenter();
    add({
      type: "circle",
      cx,
      cy,
      radius: opts?.radius ?? CIRCLE_DEFAULTS.radius,
      fill: opts?.fill ?? CIRCLE_DEFAULTS.fill,
      rotation: opts?.rotation ?? 0,
      name: opts?.name ?? "Circle",
    } as Partial<CircleEl>);
  };

  const addRing = (opts?: Partial<RingEl>) => {
    const { cx, cy } = getCenter();
    add({
      type: "ring",
      cx,
      cy,
      innerRadius: opts?.innerRadius ?? RING_DEFAULTS.innerRadius,
      outerRadius: opts?.outerRadius ?? RING_DEFAULTS.outerRadius,
      fill: opts?.fill ?? RING_DEFAULTS.fill,
      rotation: opts?.rotation ?? 0,
      name: opts?.name ?? "Ring",
    } as Partial<RingEl>);
  };

  const addText = (opts?: Partial<TextEl>) => {
    const { cx, cy } = getCenter();
    const fontSize = opts?.fontSize ?? TEXT_DEFAULTS.fontSize;
    add({
      type: "text",
      x: Math.round(cx - 60),
      y: Math.round(cy - fontSize / 2),
      text: opts?.text ?? TEXT_DEFAULTS.text,
      fontSize,
      fill: opts?.fill ?? TEXT_DEFAULTS.fill,
      rotation: opts?.rotation ?? 0,
      name: opts?.name ?? "Text",
    } as Partial<TextEl>);
  };

  const addArrow = (opts?: Partial<ArrowEl>) => {
    const { cx, cy } = getCenter();
    const [x1, y1, x2, y2] =
      (opts?.points as [number, number, number, number]) ??
      (ARROW_DEFAULTS.points as [number, number, number, number]);
    const len = Math.abs(x2 - x1);
    add({
      type: "arrow",
      x: Math.round(cx - len / 2),
      y: cy,
      points: [0, 0, len, 0],
      stroke: opts?.stroke ?? ARROW_DEFAULTS.stroke,
      strokeWidth: opts?.strokeWidth ?? ARROW_DEFAULTS.strokeWidth,
      rotation: opts?.rotation ?? 0,
      name: opts?.name ?? "Arrow",
    } as Partial<ArrowEl>);
  };

  const deleteSelected = () => {
    if (selectedId) remove(selectedId);
  };

  // ---------- drag bounds (per element)
  const dragBoundFor = (s: AnyEl) => (pos: { x: number; y: number }) => {
    const w = stageWidth;
    const h = STAGE_HEIGHT;

    if (
      s.type === "rect" ||
      s.type === "image" ||
      s.type === "text" ||
      s.type === "arrow"
    ) {
      const ref = nodeRefs.current[s.id];
      const approxW =
        s.type === "rect"
          ? (s as RectEl).width
          : s.type === "image"
          ? (s as ImageEl).width
          : Math.max(TEXT_MIN.width, ref?.width?.() ?? 120);

      const approxH =
        s.type === "rect"
          ? (s as RectEl).height
          : s.type === "image"
          ? (s as ImageEl).height
          : Math.max(TEXT_MIN.height, ref?.height?.() ?? 24);

      return {
        x: clamp(pos.x, 0, Math.max(0, w - approxW)),
        y: clamp(pos.y, 0, Math.max(0, h - approxH)),
      };
    }

    if (s.type === "circle") {
      const r = (s as CircleEl).radius;
      return {
        x: clamp(pos.x, r, Math.max(r, stageWidth - r)),
        y: clamp(pos.y, r, Math.max(r, STAGE_HEIGHT - r)),
      };
    }

    if (s.type === "ring") {
      const r = (s as RingEl).outerRadius;
      return {
        x: clamp(pos.x, r, Math.max(r, stageWidth - r)),
        y: clamp(pos.y, r, Math.max(r, STAGE_HEIGHT - r)),
      };
    }

    return pos;
  };

  // ---------- transform handler (Konva Transformer)
  const onTransformEnd = (node: any, s: AnyEl) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    if (s.type === "rect") {
      const rect = s as RectEl;
      const newW = Math.max(RECT_MIN.width, Math.round(rect.width * scaleX));
      const newH = Math.max(RECT_MIN.height, Math.round(rect.height * scaleY));
      let x = node.x(),
        y = node.y();
      x = clamp(x, 0, Math.max(0, stageWidth - newW));
      y = clamp(y, 0, Math.max(0, STAGE_HEIGHT - newH));
      update(s.id, { x, y, width: newW, height: newH, rotation });
    } else if (s.type === "image") {
      const img = s as ImageEl;
      const newW = Math.max(IMAGE_MIN.width, Math.round(img.width * scaleX));
      const newH = Math.max(IMAGE_MIN.height, Math.round(img.height * scaleY));
      let x = node.x(),
        y = node.y();
      x = clamp(x, 0, Math.max(0, stageWidth - newW));
      y = clamp(y, 0, Math.max(0, STAGE_HEIGHT - newH));
      update(s.id, { x, y, width: newW, height: newH, rotation });
    } else if (s.type === "circle") {
      const c = s as CircleEl;
      const r = Math.max(
        CIRCLE_MIN.radius,
        Math.round(c.radius * Math.max(scaleX, scaleY))
      );
      let cx = node.x(),
        cy = node.y();
      cx = clamp(cx, r, Math.max(r, stageWidth - r));
      cy = clamp(cy, r, Math.max(r, STAGE_HEIGHT - r));
      update(s.id, { cx, cy, radius: r, rotation });
    } else if (s.type === "ring") {
      const r = s as RingEl;
      const newOuter = Math.max(
        RING_MIN.outerRadius,
        Math.round(r.outerRadius * Math.max(scaleX, scaleY))
      );
      const scaleInner = r.innerRadius / r.outerRadius;
      const newInner = Math.max(
        RING_MIN.innerRadius,
        Math.round(newOuter * scaleInner)
      );
      let cx = node.x(),
        cy = node.y();
      cx = clamp(cx, newOuter, Math.max(newOuter, stageWidth - newOuter));
      cy = clamp(cy, newOuter, Math.max(newOuter, STAGE_HEIGHT - newOuter));
      update(s.id, {
        cx,
        cy,
        outerRadius: newOuter,
        innerRadius: newInner,
        rotation,
      });
    } else if (s.type === "text") {
      const t = s as TextEl;
      const newFontSize = Math.max(
        TEXT_MIN.fontSize,
        Math.round(t.fontSize * scaleY)
      );
      let x = node.x(),
        y = node.y();

      const ref = nodeRefs.current[s.id];
      const approxW = Math.max(
        TEXT_MIN.width,
        Math.round((ref?.width?.() ?? 120) * scaleX)
      );
      const approxH = Math.max(
        TEXT_MIN.height,
        Math.round(
          (ref?.height?.() ?? newFontSize) *
            (scaleY / (newFontSize / t.fontSize))
        )
      );

      x = clamp(x, 0, Math.max(0, stageWidth - approxW));
      y = clamp(y, 0, Math.max(0, STAGE_HEIGHT - approxH));
      update(s.id, { x, y, fontSize: newFontSize, rotation });
    } else if (s.type === "arrow") {
      const a = s as ArrowEl;
      const [x1, y1, x2, y2] = a.points;
      const dx = (x2 - x1) * scaleX;
      const dy = (y2 - y1) * scaleY;
      const newPoints: [number, number, number, number] = [
        x1,
        y1,
        x1 + dx,
        y1 + dy,
      ];

      let x = node.x(),
        y = node.y();
      const { width: bboxW, height: bboxH } = arrowBBoxFromPoints(
        x1,
        y1,
        x1 + dx,
        y1 + dy
      );
      const w = Math.max(ARROW_MIN.bboxWidth, Math.abs(bboxW));
      const h = Math.max(ARROW_MIN.bboxHeight, Math.abs(bboxH));
      x = clamp(x, 0, Math.max(0, stageWidth - w));
      y = clamp(y, 0, Math.max(0, STAGE_HEIGHT - h));

      update(s.id, { points: newPoints, rotation });
      node.x(x);
      node.y(y);
    }

    node.scaleX(1);
    node.scaleY(1);
  };

  return {
    // state
    elements,
    elementsTopFirst, // <— for Sidebar
    selectedId,
    selected,
    canUndo,
    canRedo,

    // selection
    selectById,
    clearSelection,

    // crud
    add,
    update,
    remove,

    // history
    undo,
    redo,

    // z-index
    moveToIndex,
    moveSelectedUp,   // <— added
    moveSelectedDown, // <— added

    // konva refs + geometry handlers
    nodeRefs,
    dragBoundFor,
    onTransformEnd,

    // centered adders
    addRectangle,
    addCircle,
    addRing,
    addText,
    addArrow,

    // convenience
    deleteSelected,
  };
}
