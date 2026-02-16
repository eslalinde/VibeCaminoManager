"use client";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { TextField } from "@radix-ui/themes";

interface GlobalFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function GlobalFilter({
  value,
  onChange,
  placeholder = "Buscar...",
}: GlobalFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(localValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [localValue, onChange]);

  return (
    <TextField.Root
      radius="large"
      size="2"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      style={{ width: "28rem" }}
    >
      <TextField.Slot>
        <Search className="h-4 w-4 text-gray-400" />
      </TextField.Slot>
      {localValue && (
        <TextField.Slot>
          <button
            type="button"
            onClick={() => setLocalValue("")}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </TextField.Slot>
      )}
    </TextField.Root>
  );
}
