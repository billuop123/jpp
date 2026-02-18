"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BACKEND_URL } from "@/scripts/lib/config";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserAdminRow {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    code: string | null;
  } | null;
  isPremium: boolean;
}

interface UserAdminPageClientProps {
  users: UserAdminRow[];
  page: number;
  limit: number;
  token: string;
}

export default function UserAdminPageClient({
  users,
  page,
  limit,
  token,
}: UserAdminPageClientProps) {
  const [currentUsers, setCurrentUsers] = useState<UserAdminRow[]>(users);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    params.set("limit", String(limit));
    router.push(`?${params.toString()}`);
  };

  const handleRoleChange = async (userId: string, roleCode: string) => {
    try {
      setIsUpdatingId(userId);
      const response = await fetch(
        `${BACKEND_URL}/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ roleCode }),
        }
      );

      const res = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(res.message || "Failed to update user role");
      }

      setCurrentUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: { code: roleCode },
              }
            : user
        )
      );

      toast.success("User role updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update user role");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Admin
          </p>
          <h1 className="text-3xl font-semibold">User Management</h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            View all users and adjust whether they are candidates or recruiters.
          </p>
        </header>

        <section className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => {
                  const roleCode = user.role?.code ?? "UNKNOWN";
                  const isAdmin = roleCode === "ADMIN";
                  const currentValue =
                    roleCode === "RECRUITER" || roleCode === "CANDIDATE"
                      ? roleCode
                      : "CANDIDATE";

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name ?? "—"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Badge variant="outline">ADMIN</Badge>
                        ) : (
                          <select
                            className="w-[140px] rounded-md border bg-background px-2 py-1 text-sm"
                            value={currentValue}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            disabled={isUpdatingId === user.id}
                          >
                            <option value="CANDIDATE">Candidate</option>
                            <option value="RECRUITER">Recruiter</option>
                          </select>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isPremium ? (
                          <Badge variant="outline">Premium</Badge>
                        ) : (
                          <Badge variant="outline" className="opacity-70">
                            Free
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{formatDate(user.updatedAt)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            <TableCaption>
              Use the dropdown to switch a user between candidate and recruiter.
              Admin roles cannot be changed.
            </TableCaption>
          </Table>
        </section>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span>
            Page {page} (showing up to {limit} users)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

