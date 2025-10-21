"use client";
import { useEffect } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { undo, redo, removeElement } from "@/store/canvasSlice";
import type { RootState } from "@/store";

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

export default function KeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const { selectedId, canUndo, canRedo } = useAppSelector(selectShortcuts);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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

      // Delete selected element: Delete or Backspace (but not while typing)
      if (!inForm && (e.key === "Delete" || e.key === "Backspace")) {
        if (selectedId) {
          e.preventDefault();
          dispatch(removeElement(selectedId));
        }
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, selectedId, canUndo, canRedo]);

  return null;
}
