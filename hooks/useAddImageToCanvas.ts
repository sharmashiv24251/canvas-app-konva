"use client";

import { useAppDispatch } from "@/store/hooks";
import { addElement } from "@/store/canvasSlice";
import type { ImageEl } from "@/types/canvas";
import { loadImageSize } from "@/lib/helpers";
import { CANVAS_SHELL_ID } from "@/constants/dom";
import { STAGE_HEIGHT } from "@/constants/canvas";
import { IMAGE_TARGET_WIDTH } from "@/constants/canvas";

type Opts = {
  /** The element that wraps your Stage (used to compute center X). */
  canvasShellId?: string;
  /** The fixed width we place images at; height is computed by aspect ratio. */
  targetWidth?: number;
  /** Your Stage height (for centering Y). */
  stageHeight?: number;
};

export function useAddImageToCanvas(
  { canvasShellId = CANVAS_SHELL_ID, targetWidth = IMAGE_TARGET_WIDTH, stageHeight = STAGE_HEIGHT }: Opts = {}
) {
  const dispatch = useAppDispatch();

  const getCenter = () => {
    // Only read DOM at call time (keeps SSR/hydration happy)
    const shell =
      typeof document !== "undefined"
        ? document.getElementById(canvasShellId)
        : null;

    // prefer shell width; fall back to window width; finally to targetWidth
    const width =
      (shell?.clientWidth ??
        (typeof window !== "undefined" ? window.innerWidth : undefined)) ??
      targetWidth;

    const cx = Math.round(width / 2);
    const cy = Math.round(stageHeight / 2);
    return { cx, cy };
  };

  const addImageFromSrc = async (
    src: string,
    name = "Image",
    width = targetWidth
  ) => {
    if (!src) return;

    // Fallbacks stay the same, but ensure >0 so we don't divide by zero
    let natW = 200;
    let natH = 220;
    try {
      const meta = await loadImageSize(src);
      if (meta && Number.isFinite(meta.width) && Number.isFinite(meta.height)) {
        natW = Math.max(1, meta.width);
        natH = Math.max(1, meta.height);
      }
    } catch {
      // ignore; keep fallback
    }

    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(w * (natH / natW)));

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
      name: name || "Image",
    };

    dispatch(addElement(el));
  };

  const addImageFromFile = async (file: File) => {
    if (!file) return;
    const src = URL.createObjectURL(file);
    try {
      await addImageFromSrc(src, file.name || "Image");
    } finally {
      // Optional: revoke after you replace src elsewhere with a permanent URL
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
