"use client";
import { GripVertical, Trash2 } from "lucide-react";

type Props = {
  kind: "image" | "circle" | "rect" | "text" | "arrow" | "ring";
  title: string;
  meta: string;
  thumbUrl?: string;
  icon?: React.ReactNode;
  coords: React.ReactNode;
  onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function SidebarListItem({
  kind,
  title,
  meta,
  thumbUrl,
  icon,
  coords,
  onDelete,
}: Props) {
  return (
    <div className="group/item relative flex items-center gap-3 px-3 py-3 hover:bg-white/[0.05] transition-colors">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-sky-400/60 via-indigo-400/60 to-purple-400/60 opacity-0 group-hover/item:opacity-100 transition-opacity" />

      {/* Left block */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {kind === "image" ? (
          <div className="h-9 w-9 rounded-md overflow-hidden ring-1 ring-white/10 shadow-sm shadow-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl}
              alt="Thumb"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-md bg-white/5 ring-1 ring-white/10 grid place-items-center">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-white/95 tracking-tight">
              {title}
            </span>
            <span className="text-[11px] text-slate-300/70 px-1.5 py-0.5 rounded-md border border-white/10">
              {meta}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-300/70">{coords}</div>
        </div>
      </div>

      {/* Right actions: Trash then Grip (small gap) */}
      <div className="ml-2 flex items-center gap-2">
        <button
          aria-label="Delete"
          title="Delete"
          onClick={onDelete}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/10 bg-white/0 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        >
          <Trash2 className="w-4 h-4 text-slate-300/90" />
        </button>
        <button
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/10 bg-white/0 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          aria-label="Reorder"
          title="Reorder"
        >
          <GripVertical className="w-4 h-4 text-slate-300/90" />
        </button>
      </div>
    </div>
  );
}
