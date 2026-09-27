"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { Field, Input } from "@/components/ui/form";
import { login } from "@/actions/auth";

function LoginForm({ next }: { next: string }) {
  const [state, dispatch, pending] = useActionState(login, { ok: false, message: "" });

  return (
    <form action={dispatch} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" htmlFor="email" required>
        <Input name="email" type="email" autoComplete="username" required placeholder="admin@example.com" />
      </Field>
      <Field label="Password" htmlFor="password" required>
        <Input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </Field>
      {!state.ok && state.message && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger-tint/50 px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-50"
      >
        <LogIn aria-hidden className="size-4" />
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export { LoginForm };
