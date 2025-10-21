"use client";
import { Sparkles, User, ImageIcon } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/0 border-b border-white/10">
      <div className="relative">
        <div className="absolute inset-x-0 -top-[1px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto max-w-[1400px] px-4 md:px-6">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-[6px] bg-gradient-to-br from-indigo-400/80 to-sky-400/80 ring-1 ring-white/25 shadow-sm shadow-indigo-500/20 grid place-items-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="text-[20px] leading-none tracking-tight text-white/95 font-semibold">
                Image Layout Editor
              </div>
              <span className=" hidden md:inline-flex h-5 items-center rounded-full border border-white/10 px-2 text-[11px] text-slate-300/70">
                Pro
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden md:inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200/90 px-3 h-9 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 cursor-pointer">
                <Sparkles className="w-4 h-4" />
                <span className="text-[12px] font-medium ">Magic Arrange</span>
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/0 hover:bg-white/10 text-slate-300/90 px-3 h-9 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 cursor-pointer">
                <User className="w-4 h-4" />
                <span className="text-[12px] font-medium hidden sm:inline cursor-pointer">
                  Account
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
