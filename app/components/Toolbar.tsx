"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Circle as CircleIcon,
  Square,
  Image as ImageIcon,
  Trash2,
  Undo2,
  Redo2,
  ArrowRight,
  Type as TypeIcon,
  CircleDashed,
} from "lucide-react";
import IconButton from "./ui/IconButton";

import { useAddImageToCanvas } from "@/hooks/useAddImageToCanvas";
import { useCanvas } from "@/hooks/useCanvas"; // ← unified hook we defined
import { CANVAS_SHELL_ID, STAGE_HEIGHT } from "@/constants"; // ← your constants

import type { RectEl, CircleEl, TextEl, RingEl } from "@/types/canvas";

export default function Toolbar() {
  // stage width is needed by useCanvas for bounds;
  // for Toolbar we can read it on demand (SSR-safe)
  const getCenter = () => {
    const shell =
      typeof document !== "undefined"
        ? document.getElementById(CANVAS_SHELL_ID)
        : null;

    const width =
      shell?.clientWidth ??
      (typeof window !== "undefined" ? window.innerWidth : undefined) ??
      0;

    const cx = Math.round(width / 2);
    const cy = Math.round(STAGE_HEIGHT / 2);
    return { cx, cy, width };
  };

  // Core canvas hook — hides Redux. Pass stageWidth for accurate bounds.
  const { width } = getCenter();
  const { selectedId, remove, add, undo, redo, canUndo, canRedo } = useCanvas({
    stageWidth: width,
  });

  // Image adder (also hides Redux)
  const { addImageFromFile, addImageFromSrc } = useAddImageToCanvas({
    canvasShellId: CANVAS_SHELL_ID,
    stageHeight: STAGE_HEIGHT,
    targetWidth: 200,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydration-safe
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // UI helpers
  const triggerImagePicker = () => fileInputRef.current?.click();

  const onImagePicked: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await addImageFromFile(file);
    } else {
      await addImageFromSrc("/images/canvas-01.jpg", "Image");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Adders (centered)
  const addRectangle = () => {
    const { cx, cy } = getCenter();
    const w = 320,
      h = 200;
    const el: Partial<RectEl> = {
      type: "rect",
      x: cx - w / 2,
      y: cy - h / 2,
      width: w,
      height: h,
      fill: "#87CEEB",
      rotation: 0,
      name: "Rectangle",
    };
    add(el);
  };

  const addCircle = () => {
    const { cx, cy } = getCenter();
    const el: Partial<CircleEl> = {
      type: "circle",
      cx,
      cy,
      radius: 90,
      fill: "#f3f4f6",
      rotation: 0,
      name: "Circle",
    };
    add(el);
  };

  const addArrow = () => {
    const { cx, cy } = getCenter();
    const len = 160;
    add({
      type: "arrow",
      x: cx - Math.round(len / 2),
      y: cy,
      points: [0, 0, len, 0],
      stroke: "#111827",
      strokeWidth: 4,
      rotation: 0,
      name: "Arrow",
    });
  };

  const addText = () => {
    const { cx, cy } = getCenter();
    const el: Partial<TextEl> = {
      type: "text",
      x: cx - 60,
      y: cy - 12,
      text: "Text",
      fontSize: 24,
      fill: "#111827",
      rotation: 0,
      name: "Text",
    };
    add(el);
  };

  const addRing = () => {
    const { cx, cy } = getCenter();
    const el: Partial<RingEl> = {
      type: "ring",
      cx,
      cy,
      innerRadius: 60,
      outerRadius: 100,
      fill: "#FACC15",
      rotation: 0,
      name: "Ring",
    };
    add(el);
  };

  const doDelete = () => {
    if (selectedId) remove(selectedId);
  };

  return (
    <div className="border-t border-white/10 bg-white/3 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="h-[60px] flex items-center gap-3">
          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Add Circle"
              tooltip="Add Circle"
              onClick={addCircle}
            >
              <CircleIcon className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton
              aria-label="Add Rectangle"
              tooltip="Add Rectangle"
              onClick={addRectangle}
            >
              <Square className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton
              aria-label="Add Image"
              tooltip="Add Image"
              onClick={triggerImagePicker}
            >
              <ImageIcon className="w-[18px] h-[18px]" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImagePicked}
              />
            </IconButton>
            <IconButton
              aria-label="Add Arrow"
              tooltip="Add Arrow"
              onClick={addArrow}
            >
              <ArrowRight className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton
              aria-label="Add Text"
              tooltip="Add Text"
              onClick={addText}
            >
              <TypeIcon className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton
              aria-label="Add Ring"
              tooltip="Add Ring"
              onClick={addRing}
            >
              <CircleDashed className="w-[18px] h-[18px]" />
            </IconButton>

            <span className="mx-1 h-6 w-px bg-white/10" />

            <IconButton
              aria-label="Delete Selected"
              tooltip={selectedId ? "Delete Selected" : "Nothing selected"}
              variant="danger"
              disabled={!selectedId}
              onClick={doDelete}
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </IconButton>

            <span className="mx-1 h-6 w-px bg-white/10" />

            <IconButton
              aria-label="Undo"
              tooltip="Undo"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton
              aria-label="Redo"
              tooltip="Redo"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 className="w-[18px] h-[18px]" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
