"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input } from "@/components/ui/form";
import { SlugField } from "@/components/admin/slug-field";
import { AdminSubmit, FormMessage } from "@/components/admin/form-state";
import { saveNewsCategory } from "@/actions/news";

/** NewsCategoryForm — inline create form for the category manager. */
function NewsCategoryForm() {
  const [state, dispatch] = useActionState(saveNewsCategory, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.ok && !done.current) {
      done.current = true;
      toast({ title: state.message, variant: "success" });
      formRef.current?.reset();
      router.refresh();
      done.current = false;
    }
  }, [state, toast, router]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <h3 className="text-base font-semibold">New topic</h3>
      <FormMessage state={state} />
      <Field label="Name" htmlFor="news-cat-name" required>
        <Input id="news-cat-name" name="name" required maxLength={191} placeholder="e.g. Trade Insights" />
      </Field>
      <SlugField nameInputId="news-cat-name" />
      <AdminSubmit label="Create topic" />
    </form>
  );
}

export { NewsCategoryForm };
