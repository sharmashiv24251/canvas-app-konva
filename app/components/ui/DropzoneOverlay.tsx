"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addElement } from "@/store/canvasSlice";
import type { ImageEl } from "@/types/canvas";

export default function DropzoneOverlay({
  targetWidth = 360,
  canvasShellId = "canvas-shell",
}: {
  targetWidth?: number;
  canvasShellId?: string;
}) {
  const dispatch = useAppDispatch();
  const [active, setActive] = useState(false);
  const dragDepthRef = useRef(0); // avoid flicker when child enters/leaves

  // ---- helpers ----
  const loadImageSize = (src: string) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({
          width: img.naturalWidth || 1,
          height: img.naturalHeight || 1,
        });
      img.onerror = reject;
      img.src = src;
    });

  const getCenter = () => {
    const shell = document.getElementById(canvasShellId);
    const width = shell?.clientWidth ?? window.innerWidth;
    const height = shell?.clientHeight ?? window.innerHeight;
    return { cx: Math.round(width / 2), cy: Math.round(height / 2) };
  };

  // ---- DnD events (global) ----
  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      // Show only if at least one file
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
    const onDragLeave = (e: DragEvent) => {
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setActive(false);
    };
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setActive(false);
      if (!e.dataTransfer) return;

      const files = Array.from(e.dataTransfer.files || []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length === 0) return;

      const { cx, cy } = getCenter();

      // Process sequentially (safer for memory) — change to Promise.all if desired
      for (const file of files) {
        const src = URL.createObjectURL(file);
        try {
          const meta = await loadImageSize(src);
          const natW = meta.width || 1;
          const natH = meta.height || 1;
          const w = targetWidth;
          const h = Math.round(w * (natH / natW));
          const x = cx - Math.round(w / 2);
          const y = cy - Math.round(h / 2);

          const el: Partial<ImageEl> = {
            type: "image",
            x,
            y,
            width: w,
            height: h,
            src,
            rotation: 0,
            name: file.name || "Image",
          };
          dispatch(addElement(el));
        } catch {
          // ignore bad file
        }
        // Optionally free the blob URL later if you re-load via <img src> elsewhere
        // setTimeout(() => URL.revokeObjectURL(src), 0);
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
  }, [active, targetWidth, canvasShellId, dispatch]);

  // Overlay is inert when inactive
  return (
    <div
      aria-hidden={!active}
      className={`fixed inset-0 z-[60] transition-opacity duration-150 pointer-events-none ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      {/* Drop area hint */}
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
