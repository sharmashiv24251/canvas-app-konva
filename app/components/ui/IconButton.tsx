import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tooltip?: string;
  variant?: "default" | "danger" | "ghost";
};

export default function IconButton({
  className,
  tooltip,
  variant = "default",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center h-10 w-10 rounded-xl border transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2";
  const variants = {
    default:
      "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-slate-200/90 focus-visible:ring-indigo-500/40",
    danger:
      "border-white/10 bg-white/0 hover:bg-red-500/10 hover:border-red-500/30 text-red-300/90 focus-visible:ring-red-500/40",
    ghost:
      "border-white/10 bg-white/0 hover:bg-white/10 text-slate-300/90 focus-visible:ring-indigo-500/40",
  };

  return (
    <div className="group relative">
      <button className={clsx(base, variants[variant], className)} {...props} />
      {tooltip && (
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[11px] text-slate-200/90 opacity-0 shadow-lg shadow-black/20 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          {tooltip}
        </div>
      )}
    </div>
  );
}
