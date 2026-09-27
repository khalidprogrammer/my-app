"use client";

import * as React from "react";
import { useActionState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { submitContact } from "@/actions/contact";

/** ContactForm — posts to contact_messages, shows inline confirmation. */
function ContactForm() {
  const [state, dispatch, pending] = useActionState(submitContact, { ok: false, message: "" });

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-lg border border-success/30 bg-success-tint/50 p-6">
        <span className="flex size-11 items-center justify-center rounded-full bg-success-tint text-success">
          <CheckCircle2 aria-hidden className="size-6" />
        </span>
        <h2 className="text-xl">Message sent</h2>
        <p className="leading-relaxed text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={dispatch} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required>
          <Input name="name" autoComplete="name" required maxLength={191} placeholder="Jane Cooper" />
        </Field>
        <Field label="Company" htmlFor="companyName">
          <Input name="companyName" autoComplete="organization" maxLength={191} placeholder="Company Ltd." />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" required>
          <Input name="email" type="email" autoComplete="email" required maxLength={191} placeholder="you@company.com" />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input name="phone" type="tel" autoComplete="tel" maxLength={50} placeholder="+1 555 000 1234" />
        </Field>
      </div>
      <Field label="Subject" htmlFor="subject">
        <Input name="subject" maxLength={255} placeholder="What is this about?" />
      </Field>
      <Field label="Message" htmlFor="message" required hint="Trade inquiries, product questions, partnership proposals.">
        <Textarea name="message" required maxLength={5000} rows={6} placeholder="How can we help?" />
      </Field>

      {!state.ok && state.message && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger-tint/50 px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-50"
        >
          <Send aria-hidden className="size-4" />
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

export { ContactForm };
