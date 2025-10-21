"use client";
import { useEffect } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  undo,
  redo,
  removeElement,
  addElement,
  select,
} from "@/store/canvasSlice";
import type { RootState } from "@/store";
import type { AnyEl } from "@/types/canvas";

// ── Clipboard payload format (plain text JSON) ────────────────────────────────
type CanvasClipboard = {
  kind: "canvas/elements";
  version: 1;
  elements: AnyEl[]; // serialized selected elements
};

// ── Selectors ────────────────────────────────────────────────────────────────
const selectShortcuts = createSelector(
  (s: RootState) => s.canvas.selectedId,
  (s: RootState) => s.canvas.past.length,
  (s: RootState) => s.canvas.future.length,
  (selectedId, past, future) => ({
    selectedId,
    canUndo: past > 0,
    canRedo: future > 0,
  })
);

const selectSelectedElements = createSelector(
  (s: RootState) => s.canvas.elements,
  (s: RootState) => s.canvas.selectedId,
  (elements, id) => {
    if (!id) return [];
    const el = elements.find((e) => e.id === id);
    return el ? [el] : [];
  }
);

// ── ID helper ────────────────────────────────────────────────────────────────
const newId = () => "el_" + Math.random().toString(36).slice(2, 9);

// ── Utilities ────────────────────────────────────────────────────────────────
function offsetElement(el: AnyEl, dx = 16, dy = 16): AnyEl {
  const id = newId();
  switch (el.type) {
    case "rect":
      return { ...el, id, x: el.x + dx, y: el.y + dy };
    case "image":
      return { ...el, id, x: el.x + dx, y: el.y + dy };
    case "text":
      return { ...el, id, x: el.x + dx, y: el.y + dy };
    case "circle":
      return { ...el, id, cx: el.cx + dx, cy: el.cy + dy };
    case "ring":
      return { ...el, id, cx: el.cx + dx, cy: el.cy + dy };
    case "arrow":
      return { ...el, id, x: (el.x ?? 0) + dx, y: (el.y ?? 0) + dy };
  }
}

async function writeClipboard(data: CanvasClipboard) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(data));
  } catch {
    // ignore (permissions/https/gesture required)
  }
}

async function readClipboard(): Promise<CanvasClipboard | null> {
  try {
    const txt = await navigator.clipboard.readText();
    const parsed = JSON.parse(txt) as CanvasClipboard;
    if (parsed?.kind === "canvas/elements" && parsed?.version === 1)
      return parsed;
    return null;
  } catch {
    return null;
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function KeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const { selectedId, canUndo, canRedo } = useAppSelector(selectShortcuts);
  const selectedEls = useAppSelector(selectSelectedElements);

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const inForm =
        target?.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT";

      const cmd = e.metaKey;
      const ctrl = e.ctrlKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      // Undo: Cmd/Ctrl + Z
      if ((cmd || ctrl) && !shift && key === "z") {
        if (canUndo) {
          e.preventDefault();
          dispatch(undo());
        }
        return;
      }

      // Redo: Shift + Cmd/Ctrl + Z
      if ((cmd || ctrl) && shift && key === "z") {
        if (canRedo) {
          e.preventDefault();
          dispatch(redo());
        }
        return;
      }

      // Delete selected element: Delete or Backspace (not while typing)
      if (!inForm && (e.key === "Delete" || e.key === "Backspace")) {
        if (selectedId) {
          e.preventDefault();
          dispatch(removeElement(selectedId));
        }
        return;
      }

      // COPY: Cmd/Ctrl + C
      if (!inForm && (cmd || ctrl) && !shift && key === "c") {
        if (selectedEls.length > 0) {
          e.preventDefault();
          const payload: CanvasClipboard = {
            kind: "canvas/elements",
            version: 1,
            elements: selectedEls,
          };
          await writeClipboard(payload);
        }
        return;
      }

      // CUT: Cmd/Ctrl + X
      if (!inForm && (cmd || ctrl) && !shift && key === "x") {
        if (selectedEls.length > 0 && selectedId) {
          e.preventDefault();
          const payload: CanvasClipboard = {
            kind: "canvas/elements",
            version: 1,
            elements: selectedEls,
          };
          await writeClipboard(payload);
          dispatch(removeElement(selectedId));
        }
        return;
      }

      // PASTE: Cmd/Ctrl + V
      if (!inForm && (cmd || ctrl) && !shift && key === "v") {
        e.preventDefault();
        const data = await readClipboard();
        if (data?.elements?.length) {
          // paste the first for now (single-select UX)
          const pasted = offsetElement(data.elements[0]);
          // If your reducer supports passing a full element with id, do this:
          dispatch(addElement(pasted as AnyEl));
          dispatch(select(pasted.id));
          // If your addElement generates id internally, instead dispatch(addElement(rest))
          // and select using what your reducer returns (or find the tail after dispatch).
        }
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, selectedId, selectedEls, canUndo, canRedo]);

  return null;
}
