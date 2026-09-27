"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { AdminSubmit, FormMessage } from "@/components/admin/form-state";
import { saveSettings, saveHomepageSection } from "@/actions/settings";

export type SettingRow = { id: string; key: string; value: string | null; type: "STRING" | "TEXT" | "NUMBER" | "BOOLEAN" | "JSON" };

/** SettingsForm — one form for every site_settings row, typed inputs. */
function SettingsForm({ settings }: { settings: SettingRow[] }) {
  const [state, dispatch] = useActionState(saveSettings, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.message && !done.current) {
      done.current = true;
      toast({ title: state.ok ? state.message : "Could not save", description: state.ok ? undefined : state.message, variant: state.ok ? "success" : "danger" });
      if (state.ok) router.refresh();
      done.current = false;
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 md:p-6">
      <h2 className="text-base font-semibold">Website settings</h2>
      <FormMessage state={state} />
      {settings.map((s) => (
        <Field key={s.id} label={s.key} htmlFor={`setting-${s.key}`}>
          {s.type === "TEXT" || s.type === "JSON" ? (
            <Textarea
              id={`setting-${s.key}`}
              name={`setting:${s.key}`}
              rows={s.type === "JSON" ? 4 : 2}
              defaultValue={s.value ?? ""}
              className={s.type === "JSON" ? "font-mono text-[13px]" : undefined}
            />
          ) : s.type === "BOOLEAN" ? (
            <Select id={`setting-${s.key}`} name={`setting:${s.key}`} defaultValue={s.value ?? "false"}>
              <option value="true">True</option>
              <option value="false">False</option>
            </Select>
          ) : (
            <Input
              id={`setting-${s.key}`}
              name={`setting:${s.key}`}
              defaultValue={s.value ?? ""}
              inputMode={s.type === "NUMBER" ? "decimal" : undefined}
            />
          )}
        </Field>
      ))}
      <div>
        <AdminSubmit label="Save settings" />
      </div>
    </form>
  );
}

export type SectionRow = {
  id: string;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  status: "ACTIVE" | "INACTIVE";
};

/** HomepageSectionForm — per-section editor (one useActionState each). */
function HomepageSectionForm({ section }: { section: SectionRow }) {
  const [state, dispatch] = useActionState(saveHomepageSection, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.message && !done.current) {
      done.current = true;
      toast({ title: state.ok ? state.message : "Could not save", description: state.ok ? undefined : state.message, variant: state.ok ? "success" : "danger" });
      if (state.ok) router.refresh();
      done.current = false;
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <input type="hidden" name="id" value={section.id} />
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">
          {section.title ?? section.sectionKey}
          <span className="ml-2 font-mono text-xs font-normal text-muted">{section.sectionKey}</span>
        </h3>
      </div>
      <FormMessage state={state} />
      <Field label="Title" htmlFor={`title-${section.id}`}>
        <Input id={`title-${section.id}`} name="title" maxLength={255} defaultValue={section.title ?? ""} />
      </Field>
      <Field label="Subtitle" htmlFor={`subtitle-${section.id}`}>
        <Textarea id={`subtitle-${section.id}`} name="subtitle" rows={2} defaultValue={section.subtitle ?? ""} />
      </Field>
      <Field label="Content" htmlFor={`content-${section.id}`}>
        <Textarea id={`content-${section.id}`} name="content" rows={3} defaultValue={section.content ?? ""} />
      </Field>
      <div className="flex items-end justify-between gap-3">
        <Field label="Status" htmlFor={`status-${section.id}`}>
          <Select id={`status-${section.id}`} name="status" defaultValue={section.status} className="w-36">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
        <AdminSubmit label="Save" />
      </div>
    </form>
  );
}

export { SettingsForm, HomepageSectionForm };
