import { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterToggleProps {
  label: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  children: ReactNode;
}

export function FilterToggle({ label, enabled, onToggle, children }: FilterToggleProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={enabled} onCheckedChange={(value) => onToggle(Boolean(value))} />
        {label}
      </label>
      <div className={enabled ? "" : "opacity-50 pointer-events-none"}>{children}</div>
    </div>
  );
}
