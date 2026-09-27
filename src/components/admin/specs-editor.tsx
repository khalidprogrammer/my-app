"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/form";

export type SpecRow = { name: string; value: string };

/**
 * SpecsEditor — dynamic name/value rows for product specifications.
 * Serialized into a hidden `specsJson` input for the server action.
 */
function SpecsEditor({ initial = [] }: { initial?: SpecRow[] }) {
  const [rows, setRows] = React.useState<SpecRow[]>(initial);

  const set = (idx: number, patch: Partial<SpecRow>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-2.5">
      <input type="hidden" name="specsJson" value={JSON.stringify(rows.filter((r) => r.name.trim() && r.value.trim()))} readOnly />
      {rows.length === 0 && (
        <p className="rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted">
          No specifications yet — add rows like “Voltage / 220V”.
        </p>
      )}
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={row.name}
            maxLength={191}
            placeholder="Name (e.g. Voltage)"
            aria-label={`Specification ${i + 1} name`}
            onChange={(e) => set(i, { name: e.target.value })}
            className="w-2/5"
          />
          <Input
            value={row.value}
            placeholder="Value (e.g. 220V)"
            aria-label={`Specification ${i + 1} value`}
            onChange={(e) => set(i, { value: e.target.value })}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
            aria-label={`Remove specification ${i + 1}`}
            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-danger transition-colors hover:bg-danger-tint"
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        </div>
      ))}
      <div>
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { name: "", value: "" }])}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3.5 text-[13px] font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          <Plus aria-hidden className="size-4" />
          Add specification
        </button>
      </div>
    </div>
  );
}

export { SpecsEditor };
