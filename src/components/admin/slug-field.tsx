"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { slugify } from "@/lib/slug";
import { Field, Input } from "@/components/ui/form";

/**
 * SlugField — slug input that auto-follows the name field until the admin
 * edits it manually (or forces regeneration).
 */
function SlugField({
  nameInputId,
  defaultValue,
  hint = "Lowercase letters, numbers and hyphens. Leave blank to auto-generate.",
}: {
  nameInputId: string;
  defaultValue?: string;
  hint?: string;
}) {
  const [value, setValue] = React.useState(defaultValue ?? "");
  const [touched, setTouched] = React.useState(Boolean(defaultValue));

  React.useEffect(() => {
    if (touched) return;
    const nameEl = document.getElementById(nameInputId) as HTMLInputElement | null;
    if (!nameEl) return;
    const sync = () => setValue(slugify(nameEl.value));
    sync();
    nameEl.addEventListener("input", sync);
    return () => nameEl.removeEventListener("input", sync);
  }, [nameInputId, touched]);

  const regenerate = () => {
    const nameEl = document.getElementById(nameInputId) as HTMLInputElement | null;
    if (nameEl) {
      setValue(slugify(nameEl.value));
      setTouched(false);
    }
  };

  return (
    <Field label="Slug" htmlFor="slug" hint={hint}>
      <div className="flex gap-2">
        <Input
          id="slug"
          name="slug"
          value={value}
          maxLength={191}
          placeholder="auto-generated-from-name"
          onChange={(e) => {
            setValue(e.target.value);
            setTouched(true);
          }}
        />
        <button
          type="button"
          onClick={regenerate}
          title="Regenerate from name"
          aria-label="Regenerate slug from name"
          className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-primary hover:text-primary"
        >
          <RefreshCw aria-hidden className="size-4" />
        </button>
      </div>
    </Field>
  );
}

export { SlugField };
