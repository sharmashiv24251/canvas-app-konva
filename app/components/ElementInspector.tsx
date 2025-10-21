"use client";
import React from "react";
import type {
  AnyEl,
  RectEl,
  TextEl,
  RingEl,
  ArrowEl,
  CircleEl,
} from "@/types/canvas";
import { EditIcon, Pipette, SlidersHorizontal } from "lucide-react";
import { useCanvas } from "@/hooks/useCanvas";
import Row from "./ui/Row";
import Label from "./ui/Label";
import ColorInput from "./ui/ColorInput";
import NumberInput from "./ui/NumberInput";
import Toggle from "./ui/Toggle";

export default function ElementInspector() {
  const { selected, update } = useCanvas({ stageWidth: 0 });

  const panelTitle = selected
    ? `Inspector — ${selected.type[0].toUpperCase()}${selected.type.slice(1)}`
    : "Inspector — No element selected";

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
            onChange={(v) => update(el.id, { fill: v })}
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
              update(el.id, {
                cornerRadius: on ? Math.max(8, el.cornerRadius ?? 12) : 0,
              })
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
                update(el.id, { cornerRadius: Math.max(0, Math.min(64, v)) })
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
          onChange={(e) => update(el.id, { text: e.target.value })}
        />
      </Row>
      <Row>
        <Label>Color</Label>
        <ColorInput
          value={el.fill}
          onChange={(v) => update(el.id, { fill: v })}
        />
      </Row>
    </>
  );

  const renderCircle = (el: CircleEl) => (
    <Row>
      <Label>Fill</Label>
      <ColorInput
        value={el.fill}
        onChange={(v) => update(el.id, { fill: v })}
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
          onChange={(v) => update(el.id, { fill: v })}
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
            update(el.id, {
              innerRadius: Math.max(1, Math.min(v, el.outerRadius - 2)),
            })
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
        onChange={(v) => update(el.id, { stroke: v })}
      />
    </Row>
  );

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
