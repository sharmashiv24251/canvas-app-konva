"use client";
import React from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";
import type {
  AnyEl,
  RectEl,
  TextEl,
  RingEl,
  ArrowEl,
  CircleEl,
} from "@/types/canvas";
import { updateElement } from "@/store/canvasSlice";
import { EditIcon, Pipette, SlidersHorizontal } from "lucide-react";

// —— selector: selected element OR null (stable, memoized)
const selectedSel = createSelector(
  (s: RootState) => s.canvas.elements,
  (s: RootState) => s.canvas.selectedId,
  (els, id) =>
    id ? (els.find((e) => e.id === id) as AnyEl | undefined) ?? null : null
);

// —— small UI atoms matching your sidebar style
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      {children}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] text-slate-300/80 flex items-center gap-2">
      {children}
    </div>
  );
}
function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="color"
      className="h-8 w-12 rounded-md border border-white/10 bg-white/10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
function NumberInput({
  value,
  min = 0,
  max = 1000,
  step = 1,
  onChange,
  className = "",
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className={
        "h-8 w-24 rounded-md border border-white/10 bg-white/10 px-2 text-[12px] text-slate-100 " +
        className
      }
    />
  );
}
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
        (checked ? "bg-indigo-500/80" : "bg-white/10")
      }
      aria-pressed={checked}
    >
      <span
        className={
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
          (checked ? "translate-x-5" : "translate-x-1")
        }
      />
    </button>
  );
}

export default function ElementInspector() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(selectedSel);

  // ——— Header title is stable whether there is a selection or not
  const panelTitle = selected
    ? `Inspector — ${selected.type[0].toUpperCase()}${selected.type.slice(1)}`
    : "Inspector — No selection";

  // ——— Per-type renderers
  const renderRect = (el: RectEl & { cornerRadius?: number }) => {
    const isRounded = (el.cornerRadius ?? 0) > 0;
    return (
      <>
        <Row>
          <Label>
            <Pipette className="w-4 h-4" />
            Fill
          </Label>
          <ColorInput
            value={el.fill}
            onChange={(v) =>
              dispatch(updateElement({ id: el.id, patch: { fill: v } }))
            }
          />
        </Row>
        <Row>
          <Label>
            <SlidersHorizontal className="w-4 h-4" />
            Rounded corners
          </Label>
          <Toggle
            checked={isRounded}
            onChange={(on) =>
              dispatch(
                updateElement({
                  id: el.id,
                  patch: {
                    cornerRadius: on ? Math.max(8, el.cornerRadius ?? 12) : 0,
                  },
                })
              )
            }
          />
        </Row>
        {isRounded && (
          <Row>
            <Label>Corner radius</Label>
            <NumberInput
              value={el.cornerRadius ?? 12}
              min={0}
              max={64}
              step={1}
              onChange={(v) =>
                dispatch(
                  updateElement({
                    id: el.id,
                    patch: { cornerRadius: Math.max(0, Math.min(64, v)) },
                  })
                )
              }
            />
          </Row>
        )}
      </>
    );
  };

  const renderText = (el: TextEl) => (
    <>
      <Row>
        <Label>Content</Label>
        <input
          className="h-8 w-40 rounded-md border border-white/10 bg-white/10 px-2 text-[12px] text-slate-100"
          value={el.text}
          onChange={(e) =>
            dispatch(
              updateElement({ id: el.id, patch: { text: e.target.value } })
            )
          }
        />
      </Row>
      <Row>
        <Label>Color</Label>
        <ColorInput
          value={el.fill}
          onChange={(v) =>
            dispatch(updateElement({ id: el.id, patch: { fill: v } }))
          }
        />
      </Row>
    </>
  );

  const renderCircle = (el: CircleEl) => (
    <Row>
      <Label>Fill</Label>
      <ColorInput
        value={el.fill}
        onChange={(v) =>
          dispatch(updateElement({ id: el.id, patch: { fill: v } }))
        }
      />
    </Row>
  );

  const renderRing = (el: RingEl) => (
    <>
      <Row>
        <Label>
          <Pipette className="w-4 h-4" />
          Fill
        </Label>
        <ColorInput
          value={el.fill}
          onChange={(v) =>
            dispatch(updateElement({ id: el.id, patch: { fill: v } }))
          }
        />
      </Row>
      <Row>
        <Label>Inner radius</Label>
        <NumberInput
          value={el.innerRadius}
          min={1}
          max={Math.max(2, el.outerRadius - 2)}
          step={1}
          onChange={(v) =>
            dispatch(
              updateElement({
                id: el.id,
                patch: {
                  innerRadius: Math.max(1, Math.min(v, el.outerRadius - 2)),
                },
              })
            )
          }
        />
      </Row>
    </>
  );

  const renderArrow = (el: ArrowEl) => (
    <Row>
      <Label>
        <Pipette className="w-4 h-4" />
        Color
      </Label>
      <ColorInput
        value={el.stroke}
        onChange={(v) =>
          dispatch(updateElement({ id: el.id, patch: { stroke: v } }))
        }
      />
    </Row>
  );

  // ——— Route by type (or neutral message when none)
  let content: React.ReactNode;
  if (!selected) {
    content = (
      <Row>
        <Label>No element selected.</Label>
      </Row>
    );
  } else {
    switch (selected.type) {
      case "rect":
        content = renderRect(selected as RectEl);
        break;
      case "text":
        content = renderText(selected as TextEl);
        break;
      case "ring":
        content = renderRing(selected as RingEl);
        break;
      case "arrow":
        content = renderArrow(selected as ArrowEl);
        break;
      case "circle":
        content = renderCircle(selected as CircleEl);
        break;
      default:
        content = (
          <Row>
            <Label>No editable properties for this element.</Label>
          </Row>
        );
    }
  }

  return (
    <aside className="mt-3 lg:pl-1">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-xl shadow-black/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 h-11 border-b border-white/10">
          <div className="flex items-center gap-2">
            <EditIcon className="w-4 h-4" />
            <h2 className="text-[13px] font-semibold tracking-tight text-white/95">
              {panelTitle}
            </h2>
          </div>
        </div>
        <div className="divide-y divide-white/10">{content}</div>
      </div>
    </aside>
  );
}
