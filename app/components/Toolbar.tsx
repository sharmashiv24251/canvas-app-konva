"use client";
import {
  Circle,
  Square,
  Image as ImageIcon,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  Ruler,
} from "lucide-react";
import IconButton from "./ui/IconButton";
export default function Toolbar() {
  return (
    <div className="border-t border-white/10 bg-white/3 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="h-[60px] flex items-center gap-3">
          <div className="flex items-center gap-2">
            <IconButton aria-label="Add Circle" tooltip="Add Circle">
              <Circle className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton aria-label="Add Rectangle" tooltip="Add Rectangle">
              <Square className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton aria-label="Add Image" tooltip="Add Image">
              <ImageIcon className="w-[18px] h-[18px]" />
            </IconButton>

            <span className="mx-1 h-6 w-px bg-white/10" />

            <IconButton
              aria-label="Delete Selected"
              tooltip="Delete Selected"
              variant="danger"
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </IconButton>

            <span className="mx-1 h-6 w-px bg-white/10" />

            <IconButton aria-label="Undo" tooltip="Undo">
              <Undo2 className="w-[18px] h-[18px]" />
            </IconButton>
            <IconButton aria-label="Redo" tooltip="Redo">
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
