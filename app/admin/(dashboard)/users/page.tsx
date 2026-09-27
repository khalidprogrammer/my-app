import Link from "next/link";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { UserForm } from "@/components/admin/user-form";
import { deleteUser } from "@/actions/users";

export const metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "users.manage")) return <AccessDenied />;

  const { edit } = await searchParams;
  const [users, roles, editing] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, status: true, lastLoginAt: true,
        userRoles: { select: { role: { select: { name: true } } } },
      },
    }),
    db.role.findMany({ orderBy: { name: "asc" }, select: { name: true, description: true } }),
    edit
      ? db.user.findUnique({
          where: { id: edit },
          select: {
            id: true, name: true, email: true, status: true,
            userRoles: { select: { role: { select: { name: true } } } },
          },
        })
      : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader title="Users" description="Admin accounts with role-based permissions." />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {users.length === 0 ? (
            <EmptyState title="No users" description="Create the first admin account." />
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className={edit === u.id ? "bg-primary-tint/50" : undefined}>
                      <TableCell>
                        <p className="font-semibold">
                          {u.name}
                          {u.id === ctx?.user.id && <span className="ml-2 text-xs font-normal text-muted">(you)</span>}
                        </p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-wrap gap-1">
                          {u.userRoles.map((r) => (
                            <Badge key={r.role.name} variant="outline">{r.role.name}</Badge>
                          ))}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={u.status} /></TableCell>
                      <TableCell className="whitespace-nowrap">
                        {u.lastLoginAt
                          ? u.lastLoginAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/users?edit=${u.id}`}
                            aria-label={`Edit ${u.name}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
                          >
                            <Pencil aria-hidden className="size-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </Link>
                          {u.id !== ctx?.user.id && (
                            <DeleteButton
                              action={deleteUser}
                              id={u.id}
                              title="Delete user?"
                              description={`${u.name} (${u.email}) will lose access immediately. Their past audit entries are kept.`}
                            />
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          )}
        </div>
        <UserForm
          key={editing?.id ?? "new"}
          allRoles={roles}
          initial={
            editing
              ? {
                  id: editing.id, name: editing.name, email: editing.email, status: editing.status,
                  roles: editing.userRoles.map((r) => r.role.name),
                }
              : undefined
          }
        />
      </div>
    </>
  );
}
