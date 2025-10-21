"use client";
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Image } from "react-konva";
import useImage from "use-image";

type Shape = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  id: string;
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

export default function Canvas() {
  // ref to parent container
  const containerRef = useRef<HTMLDivElement>(null);
  // measured size
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  // your shapes
  const [shapes, setShapes] = useState<Shape[]>([
    { id: "rect1", x: 16, y: 16, width: 320, height: 200, fill: "skyblue" },
  ]);
  const [img] = useImage("/images/canvas-01.jpg");

  // watch container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage width={width} height={500} style={{ background: "red" }}>
        <Layer>
          {shapes.map((sh, i) => (
            <Rect
              key={sh.id}
              {...sh}
              draggable
              dragBoundFunc={(pos) => ({
                x: clamp(pos.x, 0, width - sh.width),
                y: clamp(pos.y, 0, height - sh.height),
              })}
              onDragEnd={(e) => {
                const arr = [...shapes];
                arr[i] = { ...sh, x: e.target.x(), y: e.target.y() };
                setShapes(arr);
              }}
            />
          ))}

          {img && (
            <Image
              x={160}
              y={290}
              width={360}
              height={220}
              image={img}
              draggable
              dragBoundFunc={(pos) => ({
                x: clamp(pos.x, 0, width - 360),
                y: clamp(pos.y, 0, height - 220),
              })}
              onDragEnd={(e) => {
                /* same pattern to update state */
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
