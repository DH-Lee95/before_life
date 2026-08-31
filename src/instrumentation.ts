import type { Instrumentation } from "next";

export function register() {}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const normalizedError = error instanceof Error ? error : new Error("Unknown server error");
  const digest = typeof error === "object" && error !== null && "digest" in error && typeof error.digest === "string"
    ? error.digest
    : undefined;
  console.error("[request-error]", {
    name: normalizedError.name,
    message: redactOperationalMessage(normalizedError.message).slice(0, 500),
    digest,
    method: request.method,
    path: request.path.split("?", 1)[0],
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};

export function redactOperationalMessage(message: string): string {
  return message
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\b(sk-)[A-Za-z0-9_-]{8,}/g, "$1[REDACTED]");
}
