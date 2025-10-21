export default function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] text-slate-300/80 flex items-center gap-2">
      {children}
    </div>
  );
}
