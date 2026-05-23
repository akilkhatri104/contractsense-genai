"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@clerk/nextjs";
import { FileText, LoaderCircle, Sparkles, UploadCloud } from "lucide-react";
import { FileRejection, useDropzone } from "react-dropzone";

import { createAnalyzedContract } from "@/app/contracts/actions";
import { Button } from "@/components/ui/button";
import { CONTRACT_ACCEPT } from "@/lib/contracts";
import {
  buildDocumentStoragePath,
  DOCUMENTS_BUCKET,
  formatFileSize,
  MAX_DOCUMENT_SIZE_BYTES,
  resolveDocumentContentType,
} from "@/lib/documents";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type UploadStatus =
  | "analyzing"
  | "failed"
  | "queued"
  | "redirecting"
  | "uploading";

type UploadItem = {
  id: string;
  message?: string;
  name: string;
  sizeBytes: number;
  status: UploadStatus;
};

function createUploadItem(
  file: File,
  status: UploadStatus,
  message?: string,
): UploadItem {
  return {
    id: crypto.randomUUID(),
    message,
    name: file.name,
    sizeBytes: file.size,
    status,
  };
}

export function DocumentUpload() {
  const router = useRouter();
  const { getToken, isLoaded, userId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateUpload(id: string, nextUpload: Partial<UploadItem>) {
    setUploads((currentUploads) =>
      currentUploads.map((upload) =>
        upload.id === id ? { ...upload, ...nextUpload } : upload,
      ),
    );
  }

  async function handleDrop(
    acceptedFiles: File[],
    rejectedFiles: FileRejection[],
  ) {
    if (!isLoaded || !userId) {
      setErrorMessage("Sign in before uploading documents.");
      return;
    }

    setErrorMessage(null);

    if (rejectedFiles.length > 0) {
      const rejectedUploads = rejectedFiles.map(({ errors, file }) =>
        createUploadItem(
          file,
          "failed",
          errors.map((error) => error.message).join(" "),
        ),
      );

      setUploads((currentUploads) => [...rejectedUploads, ...currentUploads]);
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    const queuedUploads = acceptedFiles.map((file) =>
      createUploadItem(file, "queued"),
    );

    setUploads((currentUploads) => [...queuedUploads, ...currentUploads]);
    setIsUploading(true);

    const supabase = createClerkSupabaseClient(() => getToken());

    try {
      for (const [index, file] of acceptedFiles.entries()) {
        const queuedUpload = queuedUploads[index];

        if (!queuedUpload) {
          continue;
        }

        updateUpload(queuedUpload.id, { status: "uploading" });

        const contentType = resolveDocumentContentType(file.name, file.type);
        const storagePath = buildDocumentStoragePath(userId, file.name);

        const { error: uploadError } = await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .upload(storagePath, file, {
            cacheControl: "3600",
            contentType,
            upsert: false,
          });

        if (uploadError) {
          updateUpload(queuedUpload.id, {
            message: uploadError.message,
            status: "failed",
          });
          continue;
        }

        try {
          updateUpload(queuedUpload.id, {
            message: "Upload complete. Parsing and analyzing the contract with Gemini.",
            status: "analyzing",
          });

          const result = await createAnalyzedContract({
            bucketName: DOCUMENTS_BUCKET,
            contentType,
            originalName: file.name,
            sizeBytes: file.size,
            storagePath,
          });

          updateUpload(queuedUpload.id, {
            message:
              result.status === "completed"
                ? "Analysis complete. Opening the contract report."
                : "Analysis finished with an error. Opening the contract report.",
            status: "redirecting",
          });

          startTransition(() => {
            router.push(`/contract/${result.contractId}`);
          });
        } catch (analysisError) {
          await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);

          const message =
            analysisError instanceof Error
              ? analysisError.message
              : "Contract analysis failed.";

          updateUpload(queuedUpload.id, {
            message,
            status: "failed",
          });
        }
      }
    } finally {
      setIsUploading(false);
      startTransition(() => {
        router.refresh();
      });
    }
  }

  const { getInputProps, getRootProps, isDragActive, isDragReject, open } =
    useDropzone({
      accept: CONTRACT_ACCEPT,
      disabled: isUploading || !isLoaded,
      maxFiles: 1,
      maxSize: MAX_DOCUMENT_SIZE_BYTES,
      onDrop(acceptedFiles, rejectedFiles) {
        void handleDrop(acceptedFiles, rejectedFiles);
      },
    });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-3xl border border-dashed px-6 py-10 transition-colors",
          "bg-slate-950/70",
          isDragActive && "border-cyan-400 bg-cyan-500/10",
          isDragReject && "border-rose-400 bg-rose-500/10",
          (isUploading || !isLoaded) && "cursor-not-allowed opacity-70",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900">
            {isUploading ? (
              <LoaderCircle className="size-6 animate-spin text-cyan-300" />
            ) : (
              <UploadCloud className="size-6 text-cyan-300" />
            )}
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-100">
            Upload a contract PDF
          </h3>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Drag in one PDF. After the file lands in your private Supabase
            folder, a contract row is created and Gemini runs clause extraction,
            risk scoring, and plain-English summarization.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                open();
              }}
              disabled={isUploading || !isLoaded}
            >
              Choose PDF
            </Button>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              PDF only, {formatFileSize(MAX_DOCUMENT_SIZE_BYTES)} max
            </span>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      {uploads.length > 0 ? (
        <div className="space-y-3">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-slate-800 bg-slate-900 p-2">
                  <FileText className="size-4 text-slate-300" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-100">
                    {upload.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatFileSize(upload.sizeBytes)}
                  </p>
                  {upload.message ? (
                    <p className="mt-2 text-sm text-slate-300">
                      {upload.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                  upload.status === "failed" && "bg-rose-500/15 text-rose-200",
                  upload.status === "uploading" &&
                    "bg-cyan-500/15 text-cyan-200",
                  upload.status === "analyzing" &&
                    "bg-violet-500/15 text-violet-200",
                  upload.status === "queued" &&
                    "bg-slate-700/70 text-slate-200",
                  upload.status === "redirecting" &&
                    "bg-emerald-500/15 text-emerald-200",
                )}
              >
                {upload.status === "analyzing" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-3.5" />
                    analyzing
                  </span>
                ) : (
                  upload.status
                )}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
