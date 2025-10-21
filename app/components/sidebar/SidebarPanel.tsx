import {
  ArrowDown,
  ArrowUp,
  Circle,
  Eye,
  Layers,
  SortAsc,
  Square,
} from "lucide-react";
import SidebarListItem from "./SidebarListItem";

export default function Sidebar() {
  return (
    <aside className="lg:pl-1">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-xl shadow-black/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 h-11 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-200/90" />
            <h2 className="text-[13px] font-semibold tracking-tight text-white/95">
              Elements
            </h2>
          </div>
          <div className="inline-flex items-center gap-2">
            <button className="h-8 px-2 rounded-md border border-white/10 text-[11px] text-slate-300/90 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
              <SortAsc className="w-3.5 h-3.5" />
            </button>
            <button className="h-8 px-2 rounded-md border border-white/10 text-[11px] text-slate-300/90 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          <SidebarListItem
            kind="image"
            title="Image 01"
            meta="image"
            thumbUrl="/images/canvas-01.jpg"
            coords={
              <span>
                x:<span className="tabular-nums ml-1">160</span> y:
                <span className="tabular-nums ml-1">290</span> w:
                <span className="tabular-nums ml-1">360</span> h:
                <span className="tabular-nums ml-1">220</span>
              </span>
            }
          />
          <SidebarListItem
            kind="circle"
            title="Circle 01"
            meta="circle"
            icon={<Circle className="w-[14px] h-[14px] text-slate-200/90" />}
            coords={
              <span>
                x:<span className="tabular-nums ml-1">420</span> y:
                <span className="tabular-nums ml-1">120</span> r:
                <span className="tabular-nums ml-1">90</span>
              </span>
            }
          />
          <SidebarListItem
            kind="rectangle"
            title="Rectangle 01"
            meta="rectangle"
            icon={<Square className="w-[14px] h-[14px] text-slate-200/90" />}
            coords={
              <span>
                x:<span className="tabular-nums ml-1">64</span> y:
                <span className="tabular-nums ml-1">64</span> w:
                <span className="tabular-nums ml-1">320</span> h:
                <span className="tabular-nums ml-1">200</span>
              </span>
            }
          />
        </div>

        <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-slate-300/70">
            Drag to reorder layers (controls z-index)
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-2 rounded-md border border-white/10 text-[11px] text-slate-300/90 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button className="h-8 px-2 rounded-md border border-white/10 text-[11px] text-slate-300/90 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
