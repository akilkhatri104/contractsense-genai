import Link from "next/link";

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";

import { DocumentUpload } from "@/components/document-upload";
import { Button } from "@/components/ui/button";
import { documents } from "@/lib/db/schema";
import { formatFileSize, DOCUMENTS_BUCKET } from "@/lib/documents";
import { withClerkSupabaseRls } from "@/lib/db/rls";

export default async function DocumentsPage() {
  const { userId, getToken, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  let documentRows: Array<{
    id: string;
    bucketName: string;
    contentType: string;
    createdAt: string;
    originalName: string;
    sizeBytes: number;
    storagePath: string;
  }> | null = null;
  let error: { code?: string; message: string } | null = null;

  try {
    documentRows = await withClerkSupabaseRls(getToken, async (db) =>
      db
        .select({
          bucketName: documents.bucketName,
          contentType: documents.contentType,
          createdAt: documents.createdAt,
          id: documents.id,
          originalName: documents.originalName,
          sizeBytes: documents.sizeBytes,
          storagePath: documents.storagePath,
        })
        .from(documents)
        .orderBy(desc(documents.createdAt)),
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
      ? "The documents migration has not been applied yet. Run `supabase db push`."
      : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Clerk + Supabase Storage + Drizzle
            </p>
            <h1 className="text-3xl font-semibold">Document vault</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Files upload into the private <span className="font-mono">{DOCUMENTS_BUCKET}</span>{" "}
              bucket under your Clerk user folder. Metadata persists in
              Postgres through the same RLS transaction model used elsewhere in
              the app.
            </p>
          </div>
          <UserButton />
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Authenticated uploader</h2>
              <p className="mt-1 font-mono text-sm text-slate-400">{userId}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/tasks">Task demo</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back home</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <DocumentUpload />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Stored metadata rows</h2>
              <p className="mt-1 text-sm text-slate-400">
                Each row is filtered by Supabase RLS using your Clerk session
                claims.
              </p>
            </div>
            <span className="text-sm text-slate-400">
              {documentRows?.length ?? 0} document
              {documentRows?.length === 1 ? "" : "s"}
            </span>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <p>Supabase query failed: {error.message}</p>
              {setupHint ? <p className="mt-2">{setupHint}</p> : null}
            </div>
          ) : documentRows && documentRows.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {documentRows.map((document) => (
                <li
                  key={document.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-100">
                        {document.originalName}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {document.contentType} | {formatFileSize(document.sizeBytes)}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(document.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 font-mono text-xs text-slate-400">
                    {document.storagePath}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No document metadata rows yet. Upload a file to verify the bucket
              policy and Postgres RLS are both working for your Clerk user.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
