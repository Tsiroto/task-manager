import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import connectDB from "@/lib/db";
import { initializeUserBoard } from "@/lib/init-user-board";
import User from "@/lib/models/user";

/**
 * Initialize DB + adapter
 */
const mongooseInstance = await connectDB();
const client = mongooseInstance.connection.getClient();
const db = client.db();

/**
 * Better Auth configuration
 */
export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // 1 hour
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  /**
   * Database hooks
   */
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user.id) return;

          // Ensure DB connection (safe to call again)
          await connectDB();

          /**
           * FIRST USER = APP OWNER
           */
          const userCount = await User.countDocuments();

          if (userCount === 1) {
            await User.updateOne(
              { _id: user.id },
              { $set: { role: "owner" } }
            );
          }

          /**
           * Create default board for every user
           */
          await initializeUserBoard(user.id, "Default Board");
        },
      },
    },
  },
});

/**
 * Server-side session getter
 * Adds `role` to session.user
 */
export async function getSession() {
  const h = await headers();

  const result =
    (await auth.api.getSession?.({ headers: h })) ??
    (await auth.api.session?.({ headers: h })) ??
    null;

  if (!result || result.error) return null;

  const user = result.user;
  const session = result.session;

  if (!user?.id || !session) return null;

  // Fetch role from DB
  const dbUser = await User.findById(user.id)
    .select("role")
    .lean();

  return {
    user: {
      ...user,
      role: dbUser?.role ?? "user",
    },
    session,
  };
}

/**
 * Sign out helper
 */
export async function signOut() {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  if (result?.success) {
    redirect("/sign-in");
  }

  return result;
}
