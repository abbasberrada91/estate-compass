import { Input } from "@/components/ui/input";

interface RangeInputProps {
  labelMin: string;
  labelMax: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

export function RangeInput({
  labelMin,
  labelMax,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: RangeInputProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">{labelMin}</label>
        <Input value={minValue} onChange={(event) => onMinChange(event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">{labelMax}</label>
        <Input value={maxValue} onChange={(event) => onMaxChange(event.target.value)} />
      </div>
    </div>
  );
}
