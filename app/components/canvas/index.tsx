export default function Canvas() {
  return (
    <section className="min-w-0">
      <div className="relative group/canvas rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl shadow-black/40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

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
              {" "}
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M13 3l3 3l-6 6l-3-3zM3 21l6-2l-4-4z"
                />
              </svg>{" "}
              <span>Drag to move</span>
            </span>
            <span className="text-slate-400">|</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[10px] border rounded px-1">⌘</span>
              <span> + Z / ⇧⌘ + Z</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 min-h-[540px] md:min-h-[680px]">
          <div className="absolute inset-3 rounded-xl border-2 border-dashed border-slate-900/10 pointer-events-none opacity-0 group-hover/canvas:opacity-100 transition-opacity" />

          <div className="absolute left-16 top-16 w-[320px] h-[200px] rounded-[14px] bg-gradient-to-br from-slate-50 to-slate-100 border border-black/10 shadow-lg shadow-black/10 ring-1 ring-black/5 hover:ring-indigo-400/40 transition-colors cursor-move outline outline-1 outline-black/5">
            <div className="absolute -inset-[6px] rounded-[16px] ring-1 ring-indigo-400/30 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
          </div>

          <div className="absolute left-[420px] top-[120px] w-[180px] h-[180px] rounded-full bg-gradient-to-br from-slate-50 to-slate-100 border border-black/10 shadow-lg shadow-black/10 hover:ring-1 hover:ring-indigo-400/40 transition-colors cursor-move outline outline-1 outline-black/5" />

          <div className="absolute left-[160px] top-[290px] w-[360px] h-[220px] rounded-xl overflow-hidden border border-black/10 shadow-lg shadow-black/10 cursor-move outline outline-1 outline-black/5">
            <img
              src="/images/canvas-01.jpg"
              alt="Canvas"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none ring-0 hover:ring-1 hover:ring-indigo-400/40 transition" />
          </div>

          <div
            className="absolute top-10 left-0 right-0 h-6 bg-white/30 border-b border-black/5 backdrop-blur-sm hidden md:block"
            style={{
              maskImage: "linear-gradient(to bottom, black, transparent)",
            }}
          />
          <div
            className="absolute left-0 top-10 bottom-0 w-6 bg-white/30 border-r border-black/5 backdrop-blur-sm hidden md:block"
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
