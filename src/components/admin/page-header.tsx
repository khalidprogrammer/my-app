import type { ReactNode } from "react";

/** PageHeader — admin list/form page title row with actions. */
function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl md:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** AccessDenied — permission gate fallback inside the admin shell. */
function AccessDenied({ message = "You do not have permission to view this section." }: { message?: string }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-2 rounded-lg border border-warning/40 bg-warning-tint/50 p-6">
      <h2 className="text-lg">Access denied</h2>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export { PageHeader, AccessDenied };
