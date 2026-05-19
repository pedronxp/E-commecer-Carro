import { describe, expect, it } from "vitest";
import {
  DatabaseUnavailableError,
  isRecoverableDatabaseError,
  withDatabaseTimeout,
} from "./database-resilience";

describe("database resilience helpers", () => {
  it("fails fast when a database operation does not settle", async () => {
    await expect(withDatabaseTimeout(new Promise(() => undefined), 5)).rejects.toBeInstanceOf(
      DatabaseUnavailableError,
    );
  });

  it("treats Prisma connectivity errors as recoverable", () => {
    expect(isRecoverableDatabaseError({ code: "P1001" })).toBe(true);
    expect(isRecoverableDatabaseError(new DatabaseUnavailableError())).toBe(true);
    expect(isRecoverableDatabaseError({ code: "P2021" })).toBe(false);
  });
});
