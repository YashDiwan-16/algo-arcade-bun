import { os } from "@orpc/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { env } from "@/env";

// Admin: Get all users with filtering, sorting, and pagination
export const getUsers = os
  .input(
    z.object({
      page: z.number().int().positive().optional().default(1),
      perPage: z.number().int().positive().optional().default(10),
      sort: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      role: z.string().optional(),
      banned: z.union([z.string(), z.array(z.string())]).optional(),
    })
  )
  .output(
    z.object({
      users: z.array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          email: z.string(),
          role: z.string(),
          banned: z.boolean(),
          banReason: z.string().nullable().optional(),
          banExpires: z.coerce.date().nullable().optional(),
          createdAt: z.coerce.date().nullable().optional(),
        })
      ),
      total: z.number(),
      pageCount: z.number(),
    })
  )
  .route({
    method: "GET",
    path: "/admin/users",
  })
  .handler(async ({ input }) => {
    // Check if user is authenticated and is an admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const isAdmin =
      session.user.role === "admin" || session.user.role === "super-admin";
    if (!isAdmin) {
      throw new Error("Forbidden: Admin access required");
    }

    // Fetch users from MongoDB with filters
    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const usersCollection = db.collection("user");

    // Build MongoDB filter
    const filter: Record<string, unknown> = {};

    if (input.name) {
      filter.name = { $regex: input.name, $options: "i" };
    }

    if (input.email) {
      filter.email = { $regex: input.email, $options: "i" };
    }

    if (input.role) {
      filter.role = input.role;
    }

    if (input.banned) {
      // Handle both string and array values
      const bannedValues = Array.isArray(input.banned)
        ? input.banned
        : [input.banned];
      if (bannedValues.length === 1) {
        // Single value - exact match
        filter.banned = bannedValues[0] === "true";
      } else if (bannedValues.length > 1) {
        // Multiple values - match any
        filter.banned = {
          $in: bannedValues.map((v) => v === "true"),
        };
      }
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    if (input.sort) {
      // Format: "createdAt.desc" or "name.asc"
      const [field, direction] = input.sort.split(".");
      if (field) {
        sort[field] = direction === "asc" ? 1 : -1;
      }
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Get total count for pagination
    const total = await usersCollection.countDocuments(filter);

    // Calculate pagination
    const skip = (input.page - 1) * input.perPage;
    const pageCount = Math.ceil(total / input.perPage);

    // Fetch users
    const users = await usersCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(input.perPage)
      .toArray();

    return {
      users: users.map((user) => ({
        id: user.id || user._id?.toString() || "",
        name: user.name ?? null,
        email: user.email ?? "",
        role: user.role ?? "user",
        banned: user.banned ?? false,
        banReason: user.banReason ?? null,
        banExpires: user.banExpires ?? null,
        createdAt: user.createdAt ?? null,
      })),
      total,
      pageCount,
    };
  });

export const adminRouter = os.router({
  getUsers,
});
