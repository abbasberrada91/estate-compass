import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CityInputProps {
  label: string;
  values: string[];
  placeholder?: string;
  presets?: string[];
  onChange: (values: string[]) => void;
}

const normalize = (value: string) => value.trim().toLowerCase();

export function CityInput({ label, values, placeholder, presets = [], onChange }: CityInputProps) {
  const [input, setInput] = useState("");

  const normalized = useMemo(() => new Set(values.map(normalize)), [values]);

  const addCity = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (normalized.has(normalize(trimmed))) return;
    onChange([...values, trimmed]);
  };

  const handleAdd = () => {
    addCity(input);
    setInput("");
  };

  const handleRemove = (value: string) => {
    const target = normalize(value);
    onChange(values.filter((item) => normalize(item) !== target));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">Villes: {values.length}</span>
      </div>
      {presets.length ? (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              type="button"
              key={preset}
              variant="outline"
              size="sm"
              onClick={() => addCity(preset)}
            >
              {preset}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          Ajouter
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            type="button"
            key={value}
            className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground"
            onClick={() => handleRemove(value)}
          >
            {value} ×
          </button>
        ))}
      </div>
    </div>
  );
}
