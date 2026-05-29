export const DEFAULT_RETRY_DELAY_MS = 60_000;

export function isQuotaOrRateLimitError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("resource_exhausted") ||
    message.includes("quota exceeded") ||
    message.includes("rate limit") ||
    message.includes("statuscode: 429") ||
    message.includes("code: 429")
  );
}

export function getRetryDelayMs(error: unknown) {
  const message = getErrorMessage(error);

  const retryInfoMatch = message.match(/retryDelay\s*[:=]\s*"?(\d+)s"?/i);
  if (retryInfoMatch?.[1]) {
    return Number.parseInt(retryInfoMatch[1], 10) * 1000;
  }

  const plainSecondsMatch = message.match(/retry in\s+([\d.]+)s/i);
  if (plainSecondsMatch?.[1]) {
    return Math.ceil(Number.parseFloat(plainSecondsMatch[1]) * 1000);
  }

  return DEFAULT_RETRY_DELAY_MS;
}

export function getFriendlyQuotaMessage(error: unknown) {
  const retryMs = getRetryDelayMs(error);
  const retrySeconds = Math.max(1, Math.ceil(retryMs / 1000));

  return `Gemini free-tier quota reached. Please retry in about ${retrySeconds} seconds. The app is still working; this is a temporary model usage limit.`;
}

export async function withQuotaRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    baseDelayMs?: number;
  },
): Promise<T> {
  const maxAttempts = Math.max(1, options?.maxAttempts ?? 2);
  const baseDelayMs = Math.max(250, options?.baseDelayMs ?? 1500);

  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt += 1;

      if (!isQuotaOrRateLimitError(error) || attempt >= maxAttempts) {
        throw error;
      }

      const retryDelayMs = getRetryDelayMs(error);
      const backoffMs = baseDelayMs * 2 ** (attempt - 1);
      const waitMs = Math.max(retryDelayMs, backoffMs);

      await sleep(waitMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI request failed.");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
