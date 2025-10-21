"use client";
import React, { useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  Circle as CircleIcon,
  Layers,
  Square,
  Image as ImageIcon,
  Type as TypeIcon,
  ArrowRight,
  CircleDashed,
} from "lucide-react";
import SidebarListItem from "./SidebarListItem";
import { useCanvas } from "@/hooks/useCanvas";
import type {
  AnyEl,
  RectEl,
  CircleEl,
  ImageEl,
  TextEl,
  ArrowEl,
  RingEl,
} from "@/types/canvas";

export default function Sidebar() {
  const {
    elements,
    elementsTopFirst,
    selectedId,
    selectById,
    remove,
    moveToIndex,
    moveSelectedUp,
    moveSelectedDown,
  } = useCanvas({ stageWidth: 0 });

  // Display topmost first (prefer from hook; fallback here if not provided)
  const display =
    elementsTopFirst ??
    useMemo(() => {
      const list = [...elements].map((el, idx) => ({ el, arrayIndex: idx }));
      list.reverse();
      return list;
    }, [elements]);

  const selectedArrayIndex = selectedId
    ? elements.findIndex((e) => e.id === selectedId)
    : -1;

  const onDragStart =
    (id: string, displayIndex: number) =>
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData("text/canvas-id", id);
      e.dataTransfer.setData("text/canvas-display-index", String(displayIndex));
      selectById(id);
    };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const onDrop =
    (targetDisplayIndex: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/canvas-id");
      if (!id) return;
      // convert from reversed display index → array index
      const toArrayIndex = elements.length - 1 - targetDisplayIndex;
      moveToIndex(id, toArrayIndex);
    };

  const iconFor = (el: AnyEl) => {
    switch (el.type) {
      case "rect":
        return <Square className="w-[14px] h-[14px] text-slate-200/90" />;
      case "circle":
        return <CircleIcon className="w-[14px] h-[14px] text-slate-200/90" />;
      case "image":
        return <ImageIcon className="w-[14px] h-[14px] text-slate-200/90" />;
      case "text":
        return <TypeIcon className="w-[14px] h-[14px] text-slate-200/90" />;
      case "arrow":
        return <ArrowRight className="w-[14px] h-[14px] text-slate-200/90" />;
      case "ring":
        return <CircleDashed className="w-[14px] h-[14px] text-slate-200/90" />;
      default:
        return null;
    }
  };

  const titleFor = (el: AnyEl) =>
    el.name ?? `${el.type.charAt(0).toUpperCase()}${el.type.slice(1)}`;
  const metaFor = (el: AnyEl) => el.type;

  const coordsFor = (el: AnyEl) => {
    if (el.type === "rect") {
      const r = el as RectEl;
      return (
        <span>
          x:<span className="tabular-nums ml-1">{Math.round(r.x)}</span> y:
          <span className="tabular-nums ml-1">{Math.round(r.y)}</span> w:
          <span className="tabular-nums ml-1">{Math.round(r.width)}</span> h:
          <span className="tabular-nums ml-1">{Math.round(r.height)}</span>
        </span>
      );
    }
    if (el.type === "image") {
      const i = el as ImageEl;
      return (
        <span>
          x:<span className="tabular-nums ml-1">{Math.round(i.x)}</span> y:
          <span className="tabular-nums ml-1">{Math.round(i.y)}</span> w:
          <span className="tabular-nums ml-1">{Math.round(i.width)}</span> h:
          <span className="tabular-nums ml-1">{Math.round(i.height)}</span>
        </span>
      );
    }
    if (el.type === "circle") {
      const c = el as CircleEl;
      return (
        <span>
          x:<span className="tabular-nums ml-1">{Math.round(c.cx)}</span> y:
          <span className="tabular-nums ml-1">{Math.round(c.cy)}</span> r:
          <span className="tabular-nums ml-1">{Math.round(c.radius)}</span>
        </span>
      );
    }
    if (el.type === "ring") {
      const r = el as RingEl;
      return (
        <span>
          x:<span className="tabular-nums ml-1">{Math.round(r.cx)}</span> y:
          <span className="tabular-nums ml-1">{Math.round(r.cy)}</span> inR:
          <span className="tabular-nums ml-1">
            {Math.round(r.innerRadius)}
          </span>{" "}
          outR:
          <span className="tabular-nums ml-1">{Math.round(r.outerRadius)}</span>
        </span>
      );
    }
    if (el.type === "text") {
      const t = el as TextEl;
      return (
        <span>
          x:<span className="tabular-nums ml-1">{Math.round(t.x)}</span> y:
          <span className="tabular-nums ml-1">{Math.round(t.y)}</span> fs:
          <span className="tabular-nums ml-1">{Math.round(t.fontSize)}</span>
        </span>
      );
    }
    const a = el as ArrowEl;
    const [x1, y1, x2, y2] = a.points;
    const len = Math.round(Math.hypot(x2 - x1, y2 - y1));
    return (
      <span>
        x:<span className="tabular-nums ml-1">{Math.round(a.x ?? 0)}</span> y:
        <span className="tabular-nums ml-1">{Math.round(a.y ?? 0)}</span> len:
        <span className="tabular-nums ml-1">{len}</span>
      </span>
    );
  };

  return (
    <aside className="lg:pl-1">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-xl shadow-black/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-200/90" />
            <h2 className="text-[13px] font-semibold tracking-tight text-white/95">
              Elements
            </h2>
          </div>
          <div />
        </div>

        {/* List */}
        <div className="divide-y divide-white/10">
          {display.map(({ el }, displayIndex) => {
            const isSelected = el.id === selectedId;

            return (
              <div
                key={el.id}
                role="button"
                tabIndex={0}
                draggable
                onDragStart={onDragStart(el.id, displayIndex)}
                onDragOver={onDragOver}
                onDrop={onDrop(displayIndex)}
                onClick={() => selectById(el.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") selectById(el.id);
                }}
                className={`outline-none ${isSelected ? "bg-white/8" : ""}`}
              >
                <SidebarListItem
                  kind={el.type}
                  title={titleFor(el)}
                  meta={metaFor(el)}
                  icon={el.type === "image" ? undefined : iconFor(el)}
                  thumbUrl={
                    el.type === "image" ? (el as ImageEl).src : undefined
                  }
                  coords={coordsFor(el)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    remove(el.id);
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Footer controls */}
        <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-slate-300/70">
            Drag to reorder layers (controls z-index)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={moveSelectedUp}
              className="h-8 px-2 rounded-md border border-white/10 text-[11px] text-slate-300/90 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-40"
              disabled={
                selectedArrayIndex < 0 ||
                selectedArrayIndex === elements.length - 1
              }
              title="Move up (increase z-index)"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={moveSelectedDown}
              className="h-8 px-2 rounded-md border border-white/10 text-[11px] text-slate-300/90 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-40"
              disabled={selectedArrayIndex <= 0}
              title="Move down (decrease z-index)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
