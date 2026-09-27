"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/dialog";
import type { ActionResult } from "@/actions/_helpers";

/**
 * DeleteButton — confirm-then-delete row action (design.md §12).
 * Calls a server action with { id }, toasts the result, refreshes.
 */
function DeleteButton({
  action,
  id,
  title,
  description,
  label = "Delete",
  redirectTo,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  id: string;
  title: string;
  description: string;
  label?: string;
  redirectTo?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const confirm = () => {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const result = await action({ ok: false, message: "" }, fd);
      setOpen(false);
      if (result.ok) {
        toast({ title: result.message, variant: "success" });
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        toast({ title: "Could not delete", description: result.message, variant: "danger" });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger-tint"
      >
        <Trash2 aria-hidden className="size-3.5" />
        <span className="hidden xl:inline">{label}</span>
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={label}
        pending={pending}
        onConfirm={confirm}
      />
    </>
  );
}

export { DeleteButton };
