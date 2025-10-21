"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAddImageToCanvas } from "@/hooks/useAddImageToCanvas";

/**
 * A full-page drag & drop overlay.
 * - Shows a hint while dragging files over the page
 * - Adds dropped images to the canvas, preserving aspect ratio
 */
export default function DropzoneOverlay({
  targetWidth = 200,
  canvasShellId = "canvas-shell",
  stageHeight = 620,
}: {
  /** Final width to place images at; height is computed by aspect ratio */
  targetWidth?: number;
  /** The element id that wraps your Stage (used to compute horizontal center) */
  canvasShellId?: string;
  /** Your Stage height (used to compute vertical center) */
  stageHeight?: number;
}) {
  const [active, setActive] = useState(false);
  const dragDepthRef = useRef(0); // avoid flicker when nested dragenter/leave fire

  // Centralized image placement logic (no duplication with Toolbar)
  const { addImageFromFile } = useAddImageToCanvas({
    canvasShellId,
    targetWidth,
    stageHeight,
  });

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      // Only activate if at least one file is being dragged
      const hasFile = Array.from(e.dataTransfer.items || []).some(
        (it) => it.kind === "file"
      );
      if (!hasFile) return;
      dragDepthRef.current += 1;
      setActive(true);
    };

    const onDragOver = (e: DragEvent) => {
      // Allow drop
      e.preventDefault();
      if (!active) setActive(true);
    };

    const onDragLeave = () => {
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setActive(false);
    };

    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setActive(false);
      if (!e.dataTransfer) return;

      // Only image files
      const files = Array.from(e.dataTransfer.files || []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length === 0) return;

      // Add sequentially (keeps memory usage tame)
      for (const file of files) {
        try {
          // This preserves aspect ratio and centers on the canvas
          await addImageFromFile(file);
        } catch {
          // ignore individual file failures
        }
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [active, addImageFromFile]);

  // Overlay (pointer-events disabled so it never blocks the page)
  return (
    <div
      aria-hidden={!active}
      className={`fixed inset-0 z-[60] transition-opacity duration-150 pointer-events-none ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      {/* Drop hint */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="pointer-events-none rounded-2xl border-2 border-dashed border-white/30 bg-white/5 text-center px-6 py-10 shadow-2xl shadow-black/40 max-w-lg">
          <div className="text-[13px] uppercase tracking-widest text-white/70 mb-2">
            Drag & drop
          </div>
          <h3 className="text-2xl font-semibold text-white/95">
            Drop it like it’s hot
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Drop images anywhere on the page to add them to the canvas.
          </p>
        </div>
      </div>
    </div>
  );
}
