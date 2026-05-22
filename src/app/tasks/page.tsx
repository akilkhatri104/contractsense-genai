import Link from "next/link";

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { tasks } from "@/lib/db/schema";
import { withClerkSupabaseRls } from "@/lib/db/rls";

import { createTask } from "./actions";

export default async function TasksPage() {
  const { userId, getToken, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  let taskRows: Array<{
    id: string;
    title: string;
    createdAt: string;
  }> | null = null;
  let error: { code?: string; message: string } | null = null;

  try {
    taskRows = await withClerkSupabaseRls(getToken, async (db) =>
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          createdAt: tasks.createdAt,
        })
        .from(tasks)
        .orderBy(desc(tasks.createdAt)),
    );
  } catch (caughtError) {
    const typedError = caughtError as {
      code?: string;
      message?: string;
    };

    error = {
      code: typedError.code,
      message: typedError.message ?? "Unknown database error.",
    };
  }

  const setupHint =
    error?.code === "42P01"
      ? "The tasks table does not exist yet. Run `supabase db push` to apply the migration."
      : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Clerk + Supabase + Drizzle
            </p>
            <h1 className="text-3xl font-semibold">Protected task demo</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              This page reads and writes through Drizzle against Supabase
              Postgres. Row Level Security stays keyed off your Clerk session
              claims.
            </p>
          </div>
          <UserButton />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Signed-in Clerk user</h2>
              <p className="mt-1 font-mono text-sm text-slate-400">{userId}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">Back home</Link>
            </Button>
          </div>

          <form action={createTask} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm outline-none ring-0 placeholder:text-slate-500 focus:border-slate-500"
              name="title"
              placeholder="Add a task stored in Supabase"
              required
            />
            <Button type="submit" size="lg">
              Save task
            </Button>
          </form>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium">Your Supabase rows</h2>
            <span className="text-sm text-slate-400">
              {taskRows?.length ?? 0} item{taskRows?.length === 1 ? "" : "s"}
            </span>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <p>Supabase query failed: {error.message}</p>
              {setupHint ? <p className="mt-2">{setupHint}</p> : null}
            </div>
          ) : taskRows && taskRows.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {taskRows.map((task) => (
                <li
                  key={task.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3"
                >
                  <p className="font-medium text-slate-100">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(task.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No rows yet. Add a task to verify Drizzle is running against
              Supabase while the RLS policy scopes records to your user.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
