"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import useImage from "use-image";

type ShapeType = "rect" | "circle" | "image";

type BaseShape = {
  id: string;
  type: ShapeType;
  rotation?: number;
};

type RectShape = BaseShape & {
  type: "rect";
  x: number; // top-left
  y: number;
  width: number;
  height: number;
  fill: string;
};

type CircleShape = BaseShape & {
  type: "circle";
  cx: number; // CENTER coordinates (Konva-native)
  cy: number;
  radius: number;
  fill: string;
};

type ImageShape = BaseShape & {
  type: "image";
  x: number; // top-left
  y: number;
  width: number;
  height: number;
  src: string;
};

type AnyShape = RectShape | CircleShape | ImageShape;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

export default function Canvas() {
  // The visible, “real” canvas area
  const canvasRef = useRef<HTMLDivElement>(null);
  const [{ width: stageW }, setStageSize] = useState({ width: 0 });
  const STAGE_HEIGHT = 620;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setStageSize({ width });
    });
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  const [img] = useImage("/images/canvas-01.jpg");
  const [shapes, setShapes] = useState<AnyShape[]>([
    // Rect (top-left)
    {
      id: "rect-1",
      type: "rect",
      x: 16,
      y: 16,
      width: 320,
      height: 200,
      fill: "#87CEEB",
      rotation: 0,
    },
    // Circle (center-based to match Konva)
    {
      id: "circle-1",
      type: "circle",
      cx: 520, // center x
      cy: 210, // center y
      radius: 90,
      fill: "#f3f4f6",
      rotation: 0,
    },
    // Image (top-left)
    {
      id: "img-1",
      type: "image",
      x: 160,
      y: 290,
      width: 360,
      height: 220,
      src: "/images/canvas-01.jpg",
      rotation: 0,
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const updateShape = (id: string, patch: Partial<AnyShape>) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? ({ ...s, ...patch } as AnyShape) : s))
    );
  };

  // --- Bounds: keep nodes inside the visible Stage area ---
  const dragBoundFor = (s: AnyShape) => (pos: { x: number; y: number }) => {
    const w = stageW;
    const h = STAGE_HEIGHT;

    if (s.type === "rect") {
      return {
        x: clamp(pos.x, 0, Math.max(0, w - s.width)),
        y: clamp(pos.y, 0, Math.max(0, h - s.height)),
      };
    }
    if (s.type === "image") {
      return {
        x: clamp(pos.x, 0, Math.max(0, w - s.width)),
        y: clamp(pos.y, 0, Math.max(0, h - s.height)),
      };
    }
    // Circle uses CENTER coordinates while dragging
    const r = s.radius;
    return {
      x: clamp(pos.x, r, Math.max(r, w - r)),
      y: clamp(pos.y, r, Math.max(r, h - r)),
    };
  };

  // Keep resize/rotate inside Stage (approx by box)
  const transformerBoundBox = (
    oldBox: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    },
    newBox: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    }
  ) => {
    const w = stageW;
    const h = STAGE_HEIGHT;
    const MIN = 24;
    if (newBox.width < MIN || newBox.height < MIN) return oldBox;
    if (newBox.x < 0 || newBox.y < 0) return oldBox;
    if (newBox.x + newBox.width > w || newBox.y + newBox.height > h)
      return oldBox;
    return newBox;
  };

  // Normalize transform back into size + clamp inside
  const handleTransformEnd = (node: any, s: AnyShape) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    if (s.type === "rect") {
      const newW = Math.max(24, Math.round((s.width as number) * scaleX));
      const newH = Math.max(24, Math.round((s.height as number) * scaleY));
      let newX = node.x();
      let newY = node.y();
      newX = clamp(newX, 0, Math.max(0, stageW - newW));
      newY = clamp(newY, 0, Math.max(0, STAGE_HEIGHT - newH));
      updateShape(s.id, {
        x: newX,
        y: newY,
        width: newW,
        height: newH,
        rotation,
      } as Partial<RectShape>);
    } else if (s.type === "image") {
      const newW = Math.max(24, Math.round((s.width as number) * scaleX));
      const newH = Math.max(24, Math.round((s.height as number) * scaleY));
      let newX = node.x();
      let newY = node.y();
      newX = clamp(newX, 0, Math.max(0, stageW - newW));
      newY = clamp(newY, 0, Math.max(0, STAGE_HEIGHT - newH));
      updateShape(s.id, {
        x: newX,
        y: newY,
        width: newW,
        height: newH,
        rotation,
      } as Partial<ImageShape>);
    } else if (s.type === "circle") {
      const r = Math.max(12, Math.round(s.radius * Math.max(scaleX, scaleY)));
      let cx = node.x(); // center x
      let cy = node.y(); // center y
      cx = clamp(cx, r, Math.max(r, stageW - r));
      cy = clamp(cy, r, Math.max(r, STAGE_HEIGHT - r));
      updateShape(s.id, {
        cx,
        cy,
        radius: r,
        rotation,
      } as Partial<CircleShape>);
    }

    node.scaleX(1);
    node.scaleY(1);
  };

  // Selection / Transformer
  const shapeRefs = useRef<Record<string, any>>({});
  const transformerRef = useRef<any>(null);
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (!selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = shapeRefs.current[selectedId];
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, shapes]);

  return (
    <section className="min-w-0">
      <div className="relative group/canvas rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl shadow-black/40">
        {/* Subtle dot grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Top chrome */}
        <div className="relative z-10 h-10 flex items-center justify-between px-3 border-b border-black/5 bg-gradient-to-b from-black/[0.03] to-transparent">
          <div className="flex items-center gap-2 text-[12px] text-slate-700/80">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className="text-slate-700/60"
            >
              <path
                fill="currentColor"
                d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
              />
            </svg>
            <span className="truncate">Page — Untitled Canvas</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-700/70">
            <span className="inline-flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M13 3l3 3l-6 6l-3-3zM3 21l6-2l-4-4z"
                />
              </svg>
              <span>Drag to move</span>
            </span>
            <span className="text-slate-400">|</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[10px] border rounded px-1">⌘</span>
              <span> + Z / ⇧⌘ + Z</span>
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="relative z-10 min-h-[680px]">
          {/* The REAL canvas wrapper — this is the only area objects are allowed in */}
          <div
            ref={canvasRef}
            className="absolute left-6 right-6 top-12 rounded-xl overflow-hidden"
            style={{ height: `${STAGE_HEIGHT}px` }}
          >
            {/* Hover dashed outline sits exactly over the Stage area now */}
            <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-dashed border-slate-900/10 opacity-0 group-hover/canvas:opacity-100 transition-opacity" />

            <Stage
              width={stageW}
              height={STAGE_HEIGHT}
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) setSelectedId(null);
              }}
              onTouchStart={(e) => {
                if (e.target === e.target.getStage()) setSelectedId(null);
              }}
            >
              <Layer>
                {shapes.map((s) => {
                  if (s.type === "rect") {
                    return (
                      <Rect
                        key={s.id}
                        ref={(node) => {
                          shapeRefs.current[s.id] = node;
                        }}
                        x={s.x}
                        y={s.y}
                        width={s.width}
                        height={s.height}
                        rotation={s.rotation || 0}
                        fill={s.fill}
                        cornerRadius={14}
                        draggable
                        dragBoundFunc={dragBoundFor(s)}
                        onDragEnd={(e) =>
                          updateShape(s.id, {
                            x: e.target.x(),
                            y: e.target.y(),
                          })
                        }
                        onTransformEnd={(e) => handleTransformEnd(e.target, s)}
                        onClick={() => setSelectedId(s.id)}
                        onTap={() => setSelectedId(s.id)}
                      />
                    );
                  }
                  if (s.type === "image") {
                    return (
                      <KonvaImage
                        key={s.id}
                        ref={(node) => {
                          shapeRefs.current[s.id] = node;
                        }}
                        x={s.x}
                        y={s.y}
                        width={s.width}
                        height={s.height}
                        rotation={s.rotation || 0}
                        image={img || undefined}
                        draggable
                        dragBoundFunc={dragBoundFor(s)}
                        onDragEnd={(e) =>
                          updateShape(s.id, {
                            x: e.target.x(),
                            y: e.target.y(),
                          })
                        }
                        onTransformEnd={(e) => handleTransformEnd(e.target, s)}
                        onClick={() => setSelectedId(s.id)}
                        onTap={() => setSelectedId(s.id)}
                      />
                    );
                  }
                  // Circle (CENTER x/y)
                  return (
                    <Circle
                      key={s.id}
                      ref={(node) => {
                        shapeRefs.current[s.id] = node;
                      }}
                      x={s.cx}
                      y={s.cy}
                      radius={s.radius}
                      rotation={s.rotation || 0}
                      fill={s.fill}
                      draggable
                      dragBoundFunc={dragBoundFor(s)}
                      onDragEnd={(e) => {
                        const cx = e.target.x();
                        const cy = e.target.y();
                        // clamp just in case (dragBoundFunc already clamps)
                        const r = s.radius;
                        updateShape(s.id, {
                          cx: clamp(cx, r, Math.max(r, stageW - r)),
                          cy: clamp(cy, r, Math.max(r, STAGE_HEIGHT - r)),
                        } as Partial<CircleShape>);
                      }}
                      onTransformEnd={(e) => handleTransformEnd(e.target, s)}
                      onClick={() => setSelectedId(s.id)}
                      onTap={() => setSelectedId(s.id)}
                    />
                  );
                })}

                <Transformer
                  ref={transformerRef}
                  rotateEnabled
                  resizeEnabled
                  boundBoxFunc={transformerBoundBox}
                  anchorStroke="#6366f1"
                  anchorFill="#ffffff"
                  anchorSize={8}
                  anchorCornerRadius={2}
                  borderStroke="#6366f1"
                  borderDash={[4, 4]}
                />
              </Layer>
            </Stage>
          </div>

          {/* Soft edge masks (unchanged) */}
          <div
            className="absolute top-10 left-0 right-0 h-6  border-b border-black/5  hidden md:block"
            style={{
              maskImage: "linear-gradient(to bottom, black, transparent)",
            }}
          />
          <div
            className="absolute left-0 top-10 bottom-0 w-6 border-r border-black/5  hidden md:block"
            style={{
              maskImage: "linear-gradient(to right, black, transparent)",
            }}
          />
        </div>
      </div>

      <p className="mt-3 text-[12px] text-slate-300/70">
        Drag and drop to add images or elements onto the canvas
      </p>
    </section>
  );
}
