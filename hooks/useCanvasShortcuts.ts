"use client";
import { useEffect } from "react";
import { KEY, SHORTCUTS } from "@/constants";
import type { AnyEl } from "@/types/canvas";

type Options = {
  selectedId: string | null;
  remove: (id: string) => void;
  nudgeSelected?: (dx: number, dy: number) => void; // if you want arrow key nudging
  undo?: () => void;
  redo?: () => void;
};

export function useCanvasShortcuts({
  selectedId,
  remove,
  nudgeSelected,
  undo,
  redo,
}: Options) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === KEY.delete || e.key === KEY.backspace) {
        if (selectedId) remove(selectedId);
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) { redo?.(); } else { undo?.(); }
      }
      if ((e.ctrlKey && e.key.toLowerCase() === "y")) {
        redo?.();
      }

      // Nudge (optional)
      if (nudgeSelected && selectedId) {
        if (e.key === KEY.arrowUp) nudgeSelected(0, -1);
        if (e.key === KEY.arrowDown) nudgeSelected(0, 1);
        if (e.key === KEY.arrowLeft) nudgeSelected(-1, 0);
        if (e.key === KEY.arrowRight) nudgeSelected(1, 0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, remove, nudgeSelected, undo, redo]);
}
