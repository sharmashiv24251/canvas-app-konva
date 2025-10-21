export default function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      {children}
    </div>
  );
}
