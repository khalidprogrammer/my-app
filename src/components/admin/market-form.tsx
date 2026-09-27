"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { SlugField } from "@/components/admin/slug-field";
import { AdminSubmit, FormMessage, CancelLink } from "@/components/admin/form-state";
import { saveMarket } from "@/actions/markets";

export type MarketInitial = {
  id: string;
  name: string;
  slug: string;
  countryCode: string | null;
  type: "IMPORT" | "EXPORT" | "BOTH";
  description: string | null;
  sortOrder: number;
  status: "ACTIVE" | "INACTIVE";
};

/** MarketForm — shared create/edit side-form. */
function MarketForm({ initial }: { initial?: MarketInitial }) {
  const [state, dispatch] = useActionState(saveMarket, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.ok && !done.current) {
      done.current = true;
      toast({ title: state.message, variant: "success" });
      if (!initial) formRef.current?.reset();
      router.refresh();
      if (initial) router.push("/admin/markets");
    }
  }, [state, toast, router, initial]);

  React.useEffect(() => {
    done.current = false;
  }, [initial?.id]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">{initial ? "Edit market" : "New market"}</h2>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <FormMessage state={state} />
      <Field label="Name" htmlFor="market-name" required hint="Only add markets actually served.">
        <Input id="market-name" name="name" required maxLength={191} defaultValue={initial?.name} placeholder="e.g. Germany" />
      </Field>
      <SlugField nameInputId="market-name" defaultValue={initial?.slug} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Country code" htmlFor="market-cc" hint="ISO, e.g. DE.">
          <Input id="market-cc" name="countryCode" maxLength={10} defaultValue={initial?.countryCode ?? ""} placeholder="DE" />
        </Field>
        <Field label="Trade direction" htmlFor="market-type">
          <Select id="market-type" name="type" defaultValue={initial?.type ?? "BOTH"}>
            <option value="BOTH">Import & Export</option>
            <option value="IMPORT">Import</option>
            <option value="EXPORT">Export</option>
          </Select>
        </Field>
      </div>
      <Field label="Description" htmlFor="market-description">
        <Textarea id="market-description" name="description" rows={3} defaultValue={initial?.description ?? ""} placeholder="Lanes, ports, notes…" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Sort order" htmlFor="market-sort">
          <Input id="market-sort" name="sortOrder" inputMode="numeric" defaultValue={initial?.sortOrder ?? 0} />
        </Field>
        <Field label="Status" htmlFor="market-status">
          <Select id="market-status" name="status" defaultValue={initial?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
      </div>
      <div className="flex gap-2">
        {initial && <CancelLink href="/admin/markets" />}
        <AdminSubmit label={initial ? "Save changes" : "Create market"} className="flex-1" />
      </div>
    </form>
  );
}

export { MarketForm };
