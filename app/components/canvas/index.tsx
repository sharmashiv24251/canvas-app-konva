"use client";
import React, { useEffect, useRef } from "react";
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

import { useStageSize } from "@/hooks/useStageSize";
import { useCanvas } from "@/hooks/useCanvas";
import {
  STAGE_HEIGHT,
  CANVAS_SHELL_ID,
  TRANSFORMER_STYLE,
  TRANSFORM_MIN_SIZE,
} from "@/constants";

import type {
  AnyEl,
  RectEl,
  CircleEl,
  ImageEl,
  RingEl,
  TextEl,
  ArrowEl,
} from "@/types/canvas"; // <-- your path: "@/types/canvas"

/** Pure image node (no Redux). */
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
      ref={registerRef}
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
  // 1) Stage size from ResizeObserver (no Redux)
  const { containerRef, width: stageW } = useStageSize();

  // 2) All canvas logic hidden in the hook (Redux inside the hook only)
  const {
    elements,
    selectedId,
    selectById,
    clearSelection,
    update, // update(id, patch)
    nodeRefs, // ref map for Transformer
    dragBoundFor, // per-element drag bound function
    onTransformEnd, // Konva Transformer end-handler
  } = useCanvas({ stageWidth: stageW });

  // 3) Transformer wiring (pure UI)
  const transformerRef = useRef<any>(null);
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;

    if (!selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = nodeRefs.current[selectedId];
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, elements, nodeRefs]);

  return (
    <section className="min-w-0">
      <div className="relative rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl shadow-black/40">
        {/* REAL canvas wrapper (bounds) */}
        <div
          id={CANVAS_SHELL_ID}
          ref={containerRef}
          className="relative mx-6 mt-12 rounded-xl overflow-hidden"
          style={{ height: `${STAGE_HEIGHT}px` }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-dashed border-slate-900/10 opacity-0 hover:opacity-100 transition-opacity" />

          <Stage
            width={stageW}
            height={STAGE_HEIGHT}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) clearSelection();
            }}
            onTouchStart={(e) => {
              if (e.target === e.target.getStage()) clearSelection();
            }}
          >
            <Layer>
              {elements.map((s: AnyEl) => {
                if (s.type === "rect") {
                  const el = s as RectEl;
                  return (
                    <Rect
                      key={el.id}
                      ref={(node) => {
                        nodeRefs.current[el.id] = node;
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
                        update(el.id, { x: e.target.x(), y: e.target.y() })
                      }
                      onTransformEnd={(e) => onTransformEnd(e.target, el)}
                      onClick={() => selectById(el.id)}
                      onTap={() => selectById(el.id)}
                    />
                  );
                }

                if (s.type === "image") {
                  const el = s as ImageEl;
                  return (
                    <ImageNode
                      key={el.id}
                      el={el}
                      registerRef={(node) => (nodeRefs.current[el.id] = node)}
                      onSelect={() => selectById(el.id)}
                      dragBoundFunc={dragBoundFor(el)}
                      onDragEnd={(x, y) => update(el.id, { x, y })}
                      onTransformEnd={(node) => onTransformEnd(node, el)}
                    />
                  );
                }

                if (s.type === "circle") {
                  const el = s as CircleEl;
                  return (
                    <Circle
                      key={el.id}
                      ref={(node) => {
                        nodeRefs.current[el.id] = node;
                      }}
                      x={el.cx}
                      y={el.cy}
                      radius={el.radius}
                      rotation={el.rotation || 0}
                      fill={el.fill}
                      draggable
                      dragBoundFunc={dragBoundFor(el)}
                      onDragEnd={(e) =>
                        update(el.id, { cx: e.target.x(), cy: e.target.y() })
                      }
                      onTransformEnd={(e) => onTransformEnd(e.target, el)}
                      onClick={() => selectById(el.id)}
                      onTap={() => selectById(el.id)}
                    />
                  );
                }

                if (s.type === "ring") {
                  const el = s as RingEl;
                  return (
                    <KonvaRing
                      key={el.id}
                      ref={(node) => {
                        nodeRefs.current[el.id] = node;
                      }}
                      x={el.cx}
                      y={el.cy}
                      innerRadius={el.innerRadius}
                      outerRadius={el.outerRadius}
                      rotation={el.rotation || 0}
                      fill={el.fill}
                      draggable
                      dragBoundFunc={dragBoundFor(el)}
                      onDragEnd={(e) =>
                        update(el.id, { cx: e.target.x(), cy: e.target.y() })
                      }
                      onTransformEnd={(e) => onTransformEnd(e.target, el)}
                      onClick={() => selectById(el.id)}
                      onTap={() => selectById(el.id)}
                    />
                  );
                }

                if (s.type === "text") {
                  const el = s as TextEl;
                  return (
                    <KonvaText
                      key={el.id}
                      ref={(node) => {
                        nodeRefs.current[el.id] = node;
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
                        update(el.id, { x: e.target.x(), y: e.target.y() })
                      }
                      onTransformEnd={(e) => onTransformEnd(e.target, el)}
                      onClick={() => selectById(el.id)}
                      onTap={() => selectById(el.id)}
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
                      nodeRefs.current[el.id] = node;
                    }}
                    points={el.points}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    rotation={el.rotation || 0}
                    draggable
                    dragBoundFunc={dragBoundFor(el)}
                    onDragEnd={(e) =>
                      update(el.id, { x: e.target.x(), y: e.target.y() })
                    }
                    onTransformEnd={(e) => onTransformEnd(e.target, el)}
                    onClick={() => selectById(el.id)}
                    onTap={() => selectById(el.id)}
                  />
                );
              })}

              <Transformer
                ref={transformerRef}
                rotateEnabled
                resizeEnabled
                boundBoxFunc={(oldBox, newBox) => {
                  const MIN = TRANSFORM_MIN_SIZE ?? 12;
                  if (newBox.width < MIN || newBox.height < MIN) return oldBox;
                  if (newBox.x < 0 || newBox.y < 0) return oldBox;
                  if (
                    newBox.x + newBox.width > stageW ||
                    newBox.y + newBox.height > STAGE_HEIGHT
                  )
                    return oldBox;
                  return newBox;
                }}
                anchorStroke={TRANSFORMER_STYLE.anchorStroke}
                anchorFill={TRANSFORMER_STYLE.anchorFill}
                anchorSize={TRANSFORMER_STYLE.anchorSize}
                anchorCornerRadius={TRANSFORMER_STYLE.anchorCornerRadius}
                borderStroke={TRANSFORMER_STYLE.borderStroke}
                borderDash={TRANSFORMER_STYLE.borderDash}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </section>
  );
}
