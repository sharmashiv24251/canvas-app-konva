"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Circle as CircleIcon,
  Square,
  Image as ImageIcon,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  Ruler,
  ArrowRight,
  Type as TypeIcon,
  CircleDashed,
} from "lucide-react";
import IconButton from "./ui/IconButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addElement, removeElement, undo, redo } from "@/store/canvasSlice";
import type {
  RectEl,
  CircleEl,
  ImageEl,
  ArrowEl,
  TextEl,
  RingEl,
} from "@/types/canvas";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

const STAGE_HEIGHT = 620;

// Memoized selector to avoid rerender warning
const toolbarSel = createSelector(
  (s: RootState) => s.canvas.selectedId,
  (s: RootState) => s.canvas.past.length,
  (s: RootState) => s.canvas.future.length,
  (selectedId, pastLen, futureLen) => ({ selectedId, pastLen, futureLen })
);

export default function Toolbar() {
  const dispatch = useAppDispatch();
  const { selectedId, pastLen, futureLen } = useAppSelector(toolbarSel);

  // 🔧 All hooks must be declared before any conditional return:
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydration-safe: render after mount to avoid SSR attr mismatches
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const getCenter = () => {
    const shell = document.getElementById("envo-canvas-shell");
    const width = shell?.clientWidth ?? window.innerWidth;
    const height = STAGE_HEIGHT;
    return {
      cx: Math.round(width / 2),
      cy: Math.round(height / 2),
      width,
      height,
    };
  };

  const triggerImagePicker = () => fileInputRef.current?.click();

  const onImagePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    const { cx, cy } = getCenter();
    const w = 360,
      h = 220;
    const x = cx - Math.round(w / 2);
    const y = cy - Math.round(h / 2);
    const src = file ? URL.createObjectURL(file) : "/images/canvas-01.jpg";
    const el: Partial<ImageEl> = {
      type: "image",
      x,
      y,
      width: w,
      height: h,
      src,
      rotation: 0,
      name: "Image",
    };
    dispatch(addElement(el));
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
    dispatch(addElement(el));
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
    dispatch(addElement(el));
  };

  const addArrow = () => {
    const { cx, cy } = getCenter();
    const len = 160;
    const el: Partial<ArrowEl> = {
      type: "arrow",
      points: [cx - len / 2, cy, cx + len / 2, cy],
      stroke: "#111827",
      strokeWidth: 4,
      rotation: 0,
      name: "Arrow",
    };
    dispatch(addElement(el));
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
    dispatch(addElement(el));
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
    dispatch(addElement(el));
  };

  const doDelete = () => {
    if (selectedId) dispatch(removeElement(selectedId));
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
              onClick={() => dispatch(undo())}
              disabled={pastLen === 0}
            >
              <Undo2 className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton
              aria-label="Redo"
              tooltip="Redo"
              onClick={() => dispatch(redo())}
              disabled={futureLen === 0}
            >
              <Redo2 className="w-[18px] h-[18px]" />
            </IconButton>
          </div>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/0 px-2.5 h-9 text-[12px] text-slate-300/90">
              <ZoomIn className="w-4 h-4" />
              <span className="tabular-nums">100%</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/0 px-2.5 h-9 text-[12px] text-slate-300/90">
              <Ruler className="w-4 h-4" />
              <span>Snap: 8px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
