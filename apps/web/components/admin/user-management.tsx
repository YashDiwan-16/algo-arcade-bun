"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useDataTable } from "@/hooks/use-data-table";
import { client } from "@/lib/orpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { UserActions } from "./user-actions";
import {
  Users,
  RefreshCw,
  Mail,
  UserCircle,
  Shield,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
  createdAt?: Date | null;
}

export function UserManagement() {
  // Get URL query params
  const [queryParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: parseAsString,
    name: parseAsString,
    email: parseAsString,
    role: parseAsString,
    banned: parseAsString, // This will be comma-separated string from URL
  });

  console.log("Query params from URL:", queryParams);

  // Fetch users with query params
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "users", queryParams],
    queryFn: async () => {
      try {
        // Convert comma-separated banned string to array if needed (for multi-select)
        const bannedFilter = queryParams.banned
          ? queryParams.banned.includes(",")
            ? queryParams.banned
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            : queryParams.banned
          : undefined;

        // Ensure text fields are strings (not arrays)
        const ensureString = (
          val: string | null | undefined,
        ): string | undefined => {
          if (!val) return undefined;
          return String(val);
        };

        const requestParams = {
          page: queryParams.page,
          perPage: queryParams.perPage,
          sort: queryParams.sort ?? undefined,
          name: ensureString(queryParams.name),
          email: ensureString(queryParams.email),
          role: ensureString(queryParams.role),
          banned: bannedFilter,
        };

        console.log("Sending request with params:", requestParams);

        return await client.admin.getUsers(requestParams);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch users",
        );
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh without refetching
    gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  const users = data?.users ?? [];
  const pageCount = data?.pageCount ?? 0;

  const handleUserUpdate = () => {
    void refetch();
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name") || "N/A"}</span>
        </div>
      ),
      meta: {
        label: "Name",
        placeholder: "Search names...",
        variant: "text",
        icon: UserCircle,
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "email",
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Email" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("email")}</span>
        </div>
      ),
      meta: {
        label: "Email",
        placeholder: "Search emails...",
        variant: "text",
        icon: Mail,
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Role" />
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge
            variant={
              role === "admin" || role === "super-admin"
                ? "default"
                : "secondary"
            }
          >
            {role}
          </Badge>
        );
      },
      meta: {
        label: "Role",
        variant: "select",
        icon: Shield,
        options: [
          { label: "User", value: "user" },
          { label: "Admin", value: "admin" },
          { label: "Super Admin", value: "super-admin" },
        ],
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "banned",
      accessorKey: "banned",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => {
        const banned = row.getValue("banned") as boolean;
        return banned ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="outline" className="text-green-500 border-green-500">
            Active
          </Badge>
        );
      },
      meta: {
        label: "Status",
        variant: "select",
        options: [
          { label: "Active", value: "false" },
          { label: "Banned", value: "true" },
        ],
      },
      enableColumnFilter: true,
      enableSorting: true,
      filterFn: (row, id, value) => {
        const banned = row.getValue(id) as boolean;
        return value.includes(String(banned));
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Joined" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date | null;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{date ? new Date(date).toLocaleDateString() : "N/A"}</span>
          </div>
        );
      },
      meta: {
        label: "Joined",
        variant: "date",
        icon: Calendar,
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <UserActions user={row.original} onUpdate={handleUserUpdate} />
        </div>
      ),
      enableHiding: false,
    },
  ];

  // Use useDataTable hook with built-in URL sync via nuqs
  const { table } = useDataTable({
    data: users,
    columns,
    pageCount: pageCount,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTableSkeleton
            columnCount={6}
            rowCount={10}
            filterCount={3}
            withPagination={true}
          />
        </CardContent>
      </Card>
    );
  }

  // const hasUsers = users.length > 0;
  // const totalUsers = data?.total ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => void refetch()}
            variant="outline"
            size="sm"
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      </CardContent>
    </Card>
  );
}
