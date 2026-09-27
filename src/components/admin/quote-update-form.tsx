"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Select, Textarea } from "@/components/ui/form";
import { AdminSubmit, FormMessage } from "@/components/admin/form-state";
import { updateQuote } from "@/actions/quotes";

const STATUSES = ["NEW", "CONTACTED", "QUOTATION_SENT", "NEGOTIATION", "CONFIRMED", "COMPLETED", "REJECTED", "ARCHIVED"];

/** QuoteUpdateForm — status transition + assignment (writes history). */
function QuoteUpdateForm({
  id,
  currentStatus,
  assignedTo,
  staff,
}: {
  id: string;
  currentStatus: string;
  assignedTo: string | null;
  staff: { id: string; name: string }[];
}) {
  const [state, dispatch] = useActionState(updateQuote, { ok: false, message: "" });
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
    <form action={dispatch} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <FormMessage state={state} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="quote-status">
          <Select id="quote-status" name="status" defaultValue={currentStatus}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}</option>
            ))}
          </Select>
        </Field>
        <Field label="Assign to" htmlFor="quote-assignee">
          <Select id="quote-assignee" name="assignedTo" defaultValue={assignedTo ?? ""}>
            <option value="">Unassigned</option>
            {staff.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Status note" htmlFor="quote-note" hint="Recorded in the status history when the status changes.">
        <Textarea id="quote-note" name="note" rows={2} maxLength={2000} placeholder="e.g. Sent quotation PDF by email." />
      </Field>
      <div>
        <AdminSubmit label="Update quote" />
      </div>
    </form>
  );
}

export { QuoteUpdateForm };
