const DEFAULT_DATABASE_TIMEOUT_MS = 2500;

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database operation timed out.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export function withDatabaseTimeout<T>(
  operation: Promise<T>,
  timeoutMs = DEFAULT_DATABASE_TIMEOUT_MS,
): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => {
      const timeout = setTimeout(() => {
        reject(new DatabaseUnavailableError());
      }, timeoutMs);

      operation.then(
        () => clearTimeout(timeout),
        () => clearTimeout(timeout),
      );
    }),
  ]);
}

export function isRecoverableDatabaseError(error: unknown): boolean {
  if (error instanceof DatabaseUnavailableError) return true;
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? error.code : undefined;
  const name = "name" in error ? error.name : undefined;
  const message = "message" in error ? String(error.message) : "";

  return (
    code === "P1001" ||
    code === "P1002" ||
    code === "P1008" ||
    code === "P1017" ||
    name === "PrismaClientInitializationError" ||
    message.includes("Can't reach database server")
  );
}
