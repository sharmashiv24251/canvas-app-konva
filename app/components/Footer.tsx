import { Keyboard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-white/[0.03]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="text-[12px] text-slate-400/80">
          Precision-first canvas. Crafted for designers.
        </div>
        <div className="inline-flex items-center gap-2 text-[12px] text-slate-400/80">
          <Keyboard className="w-4 h-4" />
          <span>⌘ + / for hints</span>
        </div>
      </div>
    </footer>
  );
}
