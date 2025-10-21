export default function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="color"
      className="h-8 w-12 rounded-md border border-white/10 bg-white/10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
