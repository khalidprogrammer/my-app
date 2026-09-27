"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input, Select, Checkbox } from "@/components/ui/form";
import { AdminSubmit, FormMessage, CancelLink } from "@/components/admin/form-state";
import { saveUser } from "@/actions/users";

export type UserInitial = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  roles: string[];
};

/** UserForm — shared create/edit form with role assignment. */
function UserForm({ initial, allRoles }: { initial?: UserInitial; allRoles: { name: string; description: string | null }[] }) {
  const [state, dispatch] = useActionState(saveUser, { ok: false, message: "" });
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
      if (initial) router.push("/admin/users");
    }
  }, [state, toast, router, initial]);

  React.useEffect(() => {
    done.current = false;
  }, [initial?.id]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">{initial ? "Edit user" : "New user"}</h2>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <FormMessage state={state} />
      <Field label="Name" htmlFor="user-name" required>
        <Input id="user-name" name="name" required maxLength={191} autoComplete="off" defaultValue={initial?.name} placeholder="Full name" />
      </Field>
      <Field label="Email" htmlFor="user-email" required>
        <Input id="user-email" name="email" type="email" required maxLength={191} autoComplete="off" defaultValue={initial?.email} placeholder="user@company.com" />
      </Field>
      <Field
        label={initial ? "New password" : "Password"}
        htmlFor="user-password"
        required={!initial}
        hint={initial ? "Leave blank to keep the current password." : "At least 8 characters."}
      >
        <Input id="user-password" name="password" type="password" autoComplete="new-password" required={!initial} minLength={initial ? undefined : 8} placeholder="••••••••" />
      </Field>
      <Field label="Status" htmlFor="user-status">
        <Select id="user-status" name="status" defaultValue={initial?.status ?? "ACTIVE"}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </Field>
      <fieldset>
        <legend className="mb-1.5 block text-sm font-semibold text-ink">
          Roles <span aria-hidden className="ml-1 text-danger">*</span>
        </legend>
        <div className="flex flex-col gap-2">
          {allRoles.map((r) => (
            <label key={r.name} className="flex cursor-pointer items-start gap-2.5 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-primary">
              <Checkbox name="roles" value={r.name} defaultChecked={initial?.roles.includes(r.name)} className="mt-0.5" />
              <span>
                <span className="font-semibold">{r.name}</span>
                {r.description && <span className="block text-[13px] text-muted">{r.description}</span>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-2">
        {initial && <CancelLink href="/admin/users" />}
        <AdminSubmit label={initial ? "Save changes" : "Create user"} className="flex-1" />
      </div>
    </form>
  );
}

export { UserForm };
