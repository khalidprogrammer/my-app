"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Select } from "@/components/ui/form";
import { AdminSubmit, FormMessage } from "@/components/admin/form-state";
import { updateContact } from "@/actions/contacts";

const STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"];

/** ContactUpdateForm — per-message status + assignment (message list rows). */
function ContactUpdateForm({
  id,
  currentStatus,
  staff,
}: {
  id: string;
  currentStatus: string;
  staff: { id: string; name: string }[];
}) {
  const [state, dispatch] = useActionState(updateContact, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.message && !done.current) {
      done.current = true;
      toast({ title: state.ok ? state.message : "Could not update", description: state.ok ? undefined : state.message, variant: state.ok ? "success" : "danger" });
      if (state.ok) router.refresh();
      done.current = false;
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <FormMessage state={state} />
      <Field label="Status" htmlFor={`cs-${id}`}>
        <Select id={`cs-${id}`} name="status" defaultValue={currentStatus} className="h-9 w-36">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </Select>
      </Field>
      <Field label="Assignee" htmlFor={`ca-${id}`}>
        <Select id={`ca-${id}`} name="assignedTo" defaultValue="" className="h-9 w-44">
          <option value="">Unassigned</option>
          {staff.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
      </Field>
      <AdminSubmit label="Save" className="h-9" />
    </form>
  );
}

export { ContactUpdateForm };
