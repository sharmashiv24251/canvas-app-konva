export default function NumberInput({
  value,
  min = 0,
  max = 1000,
  step = 1,
  onChange,
  className = "",
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className={
        "h-8 w-24 rounded-md border border-white/10 bg-white/10 px-2 text-[12px] text-slate-100 " +
        className
      }
    />
  );
}
