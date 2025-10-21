"use client";
import { useEffect } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { KEY, MOD } from "@/constants/keyboard";
import type { AnyEl } from "@/types/canvas";
import { newId, offsetBy } from "@/lib/helpers";

// Clipboard payload format
type CanvasClipboard = {
  kind: "canvas/elements";
  version: 1;
  elements: AnyEl[];
};

// ----- pure utilities -----
function isFormTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.isContentEditable ||
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT"
  );
}

function offsetElement(el: AnyEl, dx = 16, dy = 16): AnyEl {
  const id = newId();
  switch (el.type) {
    case "rect":
      return { ...el, id, x: offsetBy(el.x, dx), y: offsetBy(el.y, dy) };
    case "image":
      return { ...el, id, x: offsetBy(el.x, dx), y: offsetBy(el.y, dy) };
    case "text":
      return { ...el, id, x: offsetBy(el.x, dx), y: offsetBy(el.y, dy) };
    case "circle":
      return { ...el, id, cx: offsetBy(el.cx, dx), cy: offsetBy(el.cy, dy) };
    case "ring":
      return { ...el, id, cx: offsetBy(el.cx, dx), cy: offsetBy(el.cy, dy) };
    case "arrow":
      return {
        ...el,
        id,
        x: offsetBy(el.x ?? 0, dx),
        y: offsetBy(el.y ?? 0, dy),
      };
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

// ----- component (listener only; no Redux) -----
export default function KeyboardShortcuts() {
  const {
    // state
    selectedId,
    selected,
    canUndo,
    canRedo,
    // actions
    undo,
    redo,
    remove,
    add,
    selectById,
  } = useCanvas({ stageWidth: 0 }); // not used here by the hook logic

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      const inForm = isFormTarget(e.target);
      const key = e.key;
      const lower = key.toLowerCase();
      const cmdOrCtrl =
        e.getModifierState(MOD.meta) || e.getModifierState(MOD.ctrl);
      const shift = e.getModifierState(MOD.shift);

      // Undo: Cmd/Ctrl + Z
      if (cmdOrCtrl && !shift && lower === KEY.z) {
        if (canUndo) {
          e.preventDefault();
          undo();
        }
        return;
      }

      // Redo: Shift+Cmd/Ctrl+Z OR Ctrl+Y
      if (
        (cmdOrCtrl && shift && lower === KEY.z) ||
        (!shift && lower === KEY.y && e.getModifierState(MOD.ctrl))
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
        return;
      }

      // Delete selected element
      if (!inForm && (key === KEY.delete || key === KEY.backspace)) {
        if (selectedId) {
          e.preventDefault();
          remove(selectedId);
        }
        return;
      }

      // Copy: Cmd/Ctrl + C
      if (!inForm && cmdOrCtrl && !shift && lower === KEY.c) {
        if (selected) {
          e.preventDefault();
          const payload: CanvasClipboard = {
            kind: "canvas/elements",
            version: 1,
            elements: [selected],
          };
          await writeClipboard(payload);
        }
        return;
      }

      // Cut: Cmd/Ctrl + X
      if (!inForm && cmdOrCtrl && !shift && lower === KEY.x) {
        if (selected && selectedId) {
          e.preventDefault();
          const payload: CanvasClipboard = {
            kind: "canvas/elements",
            version: 1,
            elements: [selected],
          };
          await writeClipboard(payload);
          remove(selectedId);
        }
        return;
      }

      // Paste: Cmd/Ctrl + V
      if (!inForm && cmdOrCtrl && !shift && lower === KEY.v) {
        e.preventDefault();
        const data = await readClipboard();
        if (data?.elements?.length) {
          const pasted = offsetElement(data.elements[0]);
          add(pasted as AnyEl);
          selectById(pasted.id);
        }
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selectedId,
    selected,
    canUndo,
    canRedo,
    undo,
    redo,
    remove,
    add,
    selectById,
  ]);

  return null;
}
