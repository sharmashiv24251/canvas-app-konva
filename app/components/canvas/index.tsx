"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Image as KonvaImage,
  Transformer,
  Ring as KonvaRing,
  Text as KonvaText,
  Arrow as KonvaArrow,
} from "react-konva";
import useImage from "use-image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { select, updateElement } from "@/store/canvasSlice";
import type {
  AnyEl,
  RectEl,
  CircleEl,
  ImageEl,
  RingEl,
  TextEl,
  ArrowEl,
} from "@/types/canvas";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));
const STAGE_HEIGHT = 620;

function ImageNode({
  el,
  registerRef,
  onSelect,
  dragBoundFunc,
  onDragEnd,
  onTransformEnd,
}: {
  el: ImageEl;
  registerRef: (node: any) => void;
  onSelect: () => void;
  dragBoundFunc: (pos: { x: number; y: number }) => { x: number; y: number };
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (node: any) => void;
}) {
  const [img] = useImage(el.src);
  return (
    <KonvaImage
      ref={(node) => {
        registerRef(node);
      }}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation || 0}
      image={img || undefined}
      draggable
      dragBoundFunc={dragBoundFunc}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={(e) => onTransformEnd(e.target)}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}

export default function Canvas() {
  const dispatch = useAppDispatch();
  const { elements: shapes, selectedId } = useAppSelector((s) => s.canvas);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [{ width: stageW }, setStageSize] = useState({ width: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setStageSize({ width });
    });
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

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

  const dragBoundFor = (s: AnyEl) => (pos: { x: number; y: number }) => {
    const w = stageW,
      h = STAGE_HEIGHT;

    if (
      s.type === "rect" ||
      s.type === "image" ||
      s.type === "text" ||
      s.type === "arrow"
    ) {
      // treat as top-left box for bounds
      const boxW =
        s.type === "rect"
          ? (s as RectEl).width
          : s.type === "image"
          ? (s as ImageEl).width
          : s.type === "text"
          ? Math.max(24, shapeRefs.current[s.id]?.width?.() ?? 120)
          : // arrow: approximate by its bbox (konva computes width/height)
            Math.max(24, shapeRefs.current[s.id]?.width?.() ?? 120);

      const boxH =
        s.type === "rect"
          ? (s as RectEl).height
          : s.type === "image"
          ? (s as ImageEl).height
          : s.type === "text"
          ? Math.max(24, shapeRefs.current[s.id]?.height?.() ?? 24)
          : Math.max(24, shapeRefs.current[s.id]?.height?.() ?? 24);

      return {
        x: clamp(pos.x, 0, Math.max(0, w - boxW)),
        y: clamp(pos.y, 0, Math.max(0, h - boxH)),
      };
    }

    // circle / ring use center coords
    if (s.type === "circle") {
      const r = (s as CircleEl).radius;
      return {
        x: clamp(pos.x, r, Math.max(r, w - r)),
        y: clamp(pos.y, r, Math.max(r, h - r)),
      };
    }
    if (s.type === "ring") {
      const r = (s as RingEl).outerRadius;
      return {
        x: clamp(pos.x, r, Math.max(r, w - r)),
        y: clamp(pos.y, r, Math.max(r, h - r)),
      };
    }
    return pos;
  };

  const handleTransformEnd = (node: any, s: AnyEl) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    if (s.type === "rect") {
      const rect = s as RectEl;
      const newW = Math.max(24, Math.round(rect.width * scaleX));
      const newH = Math.max(24, Math.round(rect.height * scaleY));
      let x = node.x(),
        y = node.y();
      x = clamp(x, 0, Math.max(0, stageW - newW));
      y = clamp(y, 0, Math.max(0, STAGE_HEIGHT - newH));
      dispatch(
        updateElement({
          id: s.id,
          patch: { x, y, width: newW, height: newH, rotation },
        })
      );
    } else if (s.type === "image") {
      const img = s as ImageEl;
      const newW = Math.max(24, Math.round(img.width * scaleX));
      const newH = Math.max(24, Math.round(img.height * scaleY));
      let x = node.x(),
        y = node.y();
      x = clamp(x, 0, Math.max(0, stageW - newW));
      y = clamp(y, 0, Math.max(0, STAGE_HEIGHT - newH));
      dispatch(
        updateElement({
          id: s.id,
          patch: { x, y, width: newW, height: newH, rotation },
        })
      );
    } else if (s.type === "circle") {
      const c = s as CircleEl;
      const r = Math.max(12, Math.round(c.radius * Math.max(scaleX, scaleY)));
      let cx = node.x(),
        cy = node.y();
      cx = clamp(cx, r, Math.max(r, stageW - r));
      cy = clamp(cy, r, Math.max(r, STAGE_HEIGHT - r));
      dispatch(
        updateElement({ id: s.id, patch: { cx, cy, radius: r, rotation } })
      );
    } else if (s.type === "ring") {
      const r = s as RingEl;
      const newOuter = Math.max(
        12,
        Math.round(r.outerRadius * Math.max(scaleX, scaleY))
      );
      const scaleInner = r.innerRadius / r.outerRadius;
      const newInner = Math.max(6, Math.round(newOuter * scaleInner));
      let cx = node.x(),
        cy = node.y();
      cx = clamp(cx, newOuter, Math.max(newOuter, stageW - newOuter));
      cy = clamp(cy, newOuter, Math.max(newOuter, STAGE_HEIGHT - newOuter));
      dispatch(
        updateElement({
          id: s.id,
          patch: {
            cx,
            cy,
            outerRadius: newOuter,
            innerRadius: newInner,
            rotation,
          },
        })
      );
    } else if (s.type === "text") {
      const t = s as TextEl;
      // Scale font size using Y
      const newFontSize = Math.max(8, Math.round(t.fontSize * scaleY));
      let x = node.x(),
        y = node.y();
      // approximate box
      const w = Math.max(
        24,
        Math.round((shapeRefs.current[s.id]?.width?.() ?? 120) * scaleX)
      );
      const h = Math.max(
        16,
        Math.round(
          (shapeRefs.current[s.id]?.height?.() ?? newFontSize) *
            (scaleY / (newFontSize / t.fontSize))
        )
      );
      x = clamp(x, 0, Math.max(0, stageW - w));
      y = clamp(y, 0, Math.max(0, STAGE_HEIGHT - h));
      dispatch(
        updateElement({
          id: s.id,
          patch: { x, y, fontSize: newFontSize, rotation },
        })
      );
    } else if (s.type === "arrow") {
      const a = s as ArrowEl;
      // Scale vector between p1 and p2, keep node at same x/y (konva positions the shape by x/y offset)
      const [x1, y1, x2, y2] = a.points;
      const dx = (x2 - x1) * scaleX;
      const dy = (y2 - y1) * scaleY;
      const newPoints: [number, number, number, number] = [
        x1,
        y1,
        x1 + dx,
        y1 + dy,
      ];
      let x = node.x(),
        y = node.y();
      // clamp by bbox
      const bboxW = Math.max(24, Math.abs(dx));
      const bboxH = Math.max(24, Math.abs(dy));
      x = clamp(x, 0, Math.max(0, stageW - bboxW));
      y = clamp(y, 0, Math.max(0, STAGE_HEIGHT - bboxH));
      dispatch(
        updateElement({
          id: s.id,
          patch: { points: newPoints, rotation /* keep stroke/strokeWidth */ },
        })
      );
      // keep position in bounds too
      node.x(x);
      node.y(y);
    }

    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <section className="min-w-0">
      <div className="relative rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl shadow-black/40">
        {/* REAL canvas wrapper (bounds) */}
        <div
          id="envo-canvas-shell"
          ref={canvasRef}
          className="relative mx-6 mt-12 rounded-xl overflow-hidden"
          style={{ height: `${STAGE_HEIGHT}px` }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-dashed border-slate-900/10 opacity-0 hover:opacity-100 transition-opacity" />
          <Stage
            width={stageW}
            height={STAGE_HEIGHT}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) dispatch(select(null));
            }}
            onTouchStart={(e) => {
              if (e.target === e.target.getStage()) dispatch(select(null));
            }}
          >
            <Layer>
              {shapes.map((s) => {
                if (s.type === "rect") {
                  const el = s as RectEl;
                  return (
                    <Rect
                      key={el.id}
                      ref={(node) => {
                        shapeRefs.current[el.id] = node;
                      }}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rotation={el.rotation || 0}
                      fill={el.fill}
                      cornerRadius={el.cornerRadius ?? 0}
                      draggable
                      dragBoundFunc={dragBoundFor(el)}
                      onDragEnd={(e) =>
                        dispatch(
                          updateElement({
                            id: el.id,
                            patch: { x: e.target.x(), y: e.target.y() },
                          })
                        )
                      }
                      onTransformEnd={(e) => handleTransformEnd(e.target, el)}
                      onClick={() => dispatch(select(el.id))}
                      onTap={() => dispatch(select(el.id))}
                    />
                  );
                }
                if (s.type === "image") {
                  const el = s as ImageEl;
                  return (
                    <ImageNode
                      key={el.id}
                      el={el}
                      registerRef={(node) => {
                        shapeRefs.current[el.id] = node;
                      }}
                      onSelect={() => dispatch(select(el.id))}
                      dragBoundFunc={dragBoundFor(el)}
                      onDragEnd={(x, y) =>
                        dispatch(updateElement({ id: el.id, patch: { x, y } }))
                      }
                      onTransformEnd={(node) => handleTransformEnd(node, el)}
                    />
                  );
                }
                if (s.type === "circle") {
                  const el = s as CircleEl;
                  return (
                    <Circle
                      key={el.id}
                      ref={(node) => {
                        shapeRefs.current[el.id] = node;
                      }}
                      x={el.cx}
                      y={el.cy}
                      radius={el.radius}
                      rotation={el.rotation || 0}
                      fill={el.fill}
                      draggable
                      dragBoundFunc={dragBoundFor(el)}
                      onDragEnd={(e) => {
                        const cx = e.target.x(),
                          cy = e.target.y(),
                          r = el.radius;
                        dispatch(
                          updateElement({
                            id: el.id,
                            patch: {
                              cx: clamp(cx, r, Math.max(r, stageW - r)),
                              cy: clamp(cy, r, Math.max(r, STAGE_HEIGHT - r)),
                            },
                          })
                        );
                      }}
                      onTransformEnd={(e) => handleTransformEnd(e.target, el)}
                      onClick={() => dispatch(select(el.id))}
                      onTap={() => dispatch(select(el.id))}
                    />
                  );
                }
                if (s.type === "ring") {
                  const el = s as RingEl;
                  return (
                    <KonvaRing
                      key={el.id}
                      ref={(node) => {
                        shapeRefs.current[el.id] = node;
                      }}
                      x={el.cx}
                      y={el.cy}
                      innerRadius={el.innerRadius}
                      outerRadius={el.outerRadius}
                      rotation={el.rotation || 0}
                      fill={el.fill}
                      draggable
                      dragBoundFunc={dragBoundFor(el)}
                      onDragEnd={(e) => {
                        const cx = e.target.x(),
                          cy = e.target.y(),
                          r = el.outerRadius;
                        dispatch(
                          updateElement({
                            id: el.id,
                            patch: {
                              cx: clamp(cx, r, Math.max(r, stageW - r)),
                              cy: clamp(cy, r, Math.max(r, STAGE_HEIGHT - r)),
                            },
                          })
                        );
                      }}
                      onTransformEnd={(e) => handleTransformEnd(e.target, el)}
                      onClick={() => dispatch(select(el.id))}
                      onTap={() => dispatch(select(el.id))}
                    />
                  );
                }
                if (s.type === "text") {
                  const el = s as TextEl;
                  return (
                    <KonvaText
                      key={el.id}
                      ref={(node) => {
                        shapeRefs.current[el.id] = node;
                      }}
                      x={el.x}
                      y={el.y}
                      text={el.text}
                      fontSize={el.fontSize}
                      fill={el.fill}
                      rotation={el.rotation || 0}
                      draggable
                      dragBoundFunc={dragBoundFor(el)}
                      onDragEnd={(e) =>
                        dispatch(
                          updateElement({
                            id: el.id,
                            patch: { x: e.target.x(), y: e.target.y() },
                          })
                        )
                      }
                      onTransformEnd={(e) => handleTransformEnd(e.target, el)}
                      onClick={() => dispatch(select(el.id))}
                      onTap={() => dispatch(select(el.id))}
                    />
                  );
                }
                // arrow
                const el = s as ArrowEl;
                return (
                  <KonvaArrow
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    ref={(node) => {
                      shapeRefs.current[el.id] = node;
                    }}
                    points={el.points}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    rotation={el.rotation || 0}
                    draggable
                    dragBoundFunc={dragBoundFor(el)}
                    onDragEnd={(e) =>
                      dispatch(
                        updateElement({
                          id: el.id,
                          patch: {
                            x: e.target.x(),
                            y: e.target.y(),
                          },
                        })
                      )
                    }
                    onTransformEnd={(e) => handleTransformEnd(e.target, el)}
                    onClick={() => dispatch(select(el.id))}
                    onTap={() => dispatch(select(el.id))}
                  />
                );
              })}

              <Transformer
                ref={transformerRef}
                rotateEnabled
                resizeEnabled
                boundBoxFunc={(oldBox, newBox) => {
                  const MIN = 12;
                  if (newBox.width < MIN || newBox.height < MIN) return oldBox;
                  if (newBox.x < 0 || newBox.y < 0) return oldBox;
                  if (
                    newBox.x + newBox.width > stageW ||
                    newBox.y + newBox.height > STAGE_HEIGHT
                  )
                    return oldBox;
                  return newBox;
                }}
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
      </div>
    </section>
  );
}
