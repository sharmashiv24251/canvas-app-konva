"use client";

import { useAppDispatch } from "@/store/hooks";
import { addElement } from "@/store/canvasSlice";
import type { ImageEl } from "@/types/canvas";
import { loadImageSize } from "@/lib/helpers";

type Opts = {
  /** The element that wraps your Stage (used to compute center X). */
  canvasShellId?: string;
  /** The fixed width we place images at; height is computed by aspect ratio. */
  targetWidth?: number;
  /** Your Stage height (for centering Y). */
  stageHeight?: number;
};

export function useAddImageToCanvas(
  { canvasShellId = "canvas-shell", targetWidth = 200, stageHeight = 620 }: Opts = {}
) {
  const dispatch = useAppDispatch();

  const getCenter = () => {
    // Only read DOM at call time (keeps SSR/hydration happy)
    const shell = typeof document !== "undefined" ? document.getElementById(canvasShellId) : null;
    const width = shell?.clientWidth ?? (typeof window !== "undefined" ? window.innerWidth : targetWidth);
    const cx = Math.round(width / 2);
    const cy = Math.round(stageHeight / 2);
    return { cx, cy };
  };

  const addImageFromSrc = async (src: string, name = "Image", width = targetWidth) => {
    let natW = 200;
    let natH = 220;
    try {
      const meta = await loadImageSize(src);
      natW = meta.width || 200;
      natH = meta.height || 220;
    } catch {
      // ignore; keep fallback
    }

    const w = width;
    const h = Math.round(w * (natH / natW));
    const { cx, cy } = getCenter();
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
      name,
    };
    dispatch(addElement(el));
  };

  const addImageFromFile = async (file: File) => {
    const src = URL.createObjectURL(file);
    try {
      await addImageFromSrc(src, file.name || "Image");
    } finally {
      // Optional: revoke if you later reload via <img src={src}> elsewhere.
      // setTimeout(() => URL.revokeObjectURL(src), 0);
    }
  };

  const onFileInputChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (file) await addImageFromFile(file);
    if (e.currentTarget) e.currentTarget.value = "";
  };

  return {
    addImageFromSrc,
    addImageFromFile,
    onFileInputChange,
  };
}
