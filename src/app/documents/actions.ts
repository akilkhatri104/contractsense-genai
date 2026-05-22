"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  DOCUMENTS_BUCKET,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/documents";
import { documents } from "@/lib/db/schema";
import { withClerkSupabaseRls } from "@/lib/db/rls";

type SaveUploadedDocumentInput = {
  bucketName: string;
  contentType: string;
  originalName: string;
  sizeBytes: number;
  storagePath: string;
};

export async function saveUploadedDocument(input: SaveUploadedDocumentInput) {
  const { userId, getToken } = await auth();

  if (!userId) {
    throw new Error("Not authenticated.");
  }

  const originalName = input.originalName.trim();
  const contentType = input.contentType.trim();
  const storagePath = input.storagePath.trim();

  if (!originalName) {
    throw new Error("File name is required.");
  }

  if (!contentType) {
    throw new Error("Content type is required.");
  }

  if (input.bucketName !== DOCUMENTS_BUCKET) {
    throw new Error("Unexpected bucket.");
  }

  if (!storagePath.startsWith(`${userId}/`)) {
    throw new Error("Storage path must stay inside the current user's folder.");
  }

  if (
    !Number.isFinite(input.sizeBytes) ||
    input.sizeBytes <= 0 ||
    input.sizeBytes > MAX_DOCUMENT_SIZE_BYTES
  ) {
    throw new Error("Invalid file size.");
  }

  await withClerkSupabaseRls(getToken, async (db) => {
    await db.insert(documents).values({
      bucketName: input.bucketName,
      contentType,
      originalName,
      sizeBytes: input.sizeBytes,
      storagePath,
      userId,
    });
  });

  revalidatePath("/documents");
}
