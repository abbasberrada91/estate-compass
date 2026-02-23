import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  label: string;
  values: string[];
  placeholder?: string;
  suggestions?: string[];
  onChange: (values: string[]) => void;
}

export function TagInput({ label, values, placeholder, suggestions, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed)) {
      setInput("");
      return;
    }
    onChange([...values, trimmed]);
    setInput("");
  };

  const handleRemove = (value: string) => {
    onChange(values.filter((item) => item !== value));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        <Input
          list={suggestions?.length ? `${label}-suggestions` : undefined}
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
      {suggestions?.length ? (
        <datalist id={`${label}-suggestions`}>
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      ) : null}
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
