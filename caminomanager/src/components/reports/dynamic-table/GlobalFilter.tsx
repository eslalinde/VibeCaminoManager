"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
    <div className="relative flex items-center">
      <Search className="absolute left-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 max-w-sm"
      />
    </div>
  );
}
