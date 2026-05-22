export const DOCUMENTS_BUCKET = "documents";
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const DOCUMENT_ACCEPT: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/rtf": [".rtf"],
  "text/plain": [".txt"],
};

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  rtf: "application/rtf",
  txt: "text/plain",
};

export function resolveDocumentContentType(fileName: string, mimeType?: string) {
  if (mimeType && mimeType.trim()) {
    return mimeType;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) {
    return "application/octet-stream";
  }

  return CONTENT_TYPE_BY_EXTENSION[extension] ?? "application/octet-stream";
}

export function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildDocumentStoragePath(userId: string, fileName: string) {
  return `${userId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
