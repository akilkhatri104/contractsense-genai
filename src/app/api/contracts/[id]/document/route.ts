import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { contracts, documents } from "@/lib/db/schema";
import { withClerkSupabaseRls } from "@/lib/db/rls";
import { createClerkSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, getToken } = await auth();

  if (!userId) {
    return new Response("Not authenticated.", { status: 401 });
  }

  const { id } = await params;
  const contractId = id.trim();

  if (!contractId) {
    return new Response("Contract id is required.", { status: 400 });
  }

  const [contract] = await withClerkSupabaseRls(getToken, async (db) =>
    db
      .select({
        bucketName: documents.bucketName,
        contentType: documents.contentType,
        originalName: documents.originalName,
        storagePath: documents.storagePath,
      })
      .from(contracts)
      .innerJoin(documents, eq(contracts.documentId, documents.id))
      .where(and(eq(contracts.id, contractId), eq(contracts.userId, userId))),
  );

  if (!contract) {
    return new Response("Contract not found.", { status: 404 });
  }

  const supabase = await createClerkSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(contract.bucketName)
    .download(contract.storagePath);

  if (error) {
    return new Response(`Failed to fetch document: ${error.message}`, { status: 500 });
  }

  const bytes = await data.arrayBuffer();
  const fileName = encodeURIComponent(contract.originalName);
  const isInlinePdf = contract.contentType === "application/pdf";

  return new Response(bytes, {
    headers: {
      "Content-Disposition": `${isInlinePdf ? "inline" : "attachment"}; filename*=UTF-8''${fileName}`,
      "Content-Type": contract.contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=60",
    },
  });
}
