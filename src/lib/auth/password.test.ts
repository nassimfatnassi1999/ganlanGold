import { describe, expect, it } from "vitest";
import { assertStrongPassword, hashPassword, verifyPassword } from "./password";

describe("administrator passwords", () => {
  it("hashes and verifies a strong password without retaining plaintext", async () => {
    const password = "Maroc-Gold-2026!Safe";
    const hash = await hashPassword(password, 4);
    expect(hash).not.toContain(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it.each(["short", "alllowercasebutlong1!", "ALLUPPERCASEBUTLONG1!", "NoDigitsHere!Long", "NoSymbolHere2026"])(
    "rejects a weak initial password: %s",
    (password) => {
      expect(() => assertStrongPassword(password)).toThrow();
    },
  );

  it("accepts a long mixed-category password", () => {
    expect(() => assertStrongPassword("Maroc-Gold-2026!Safe")).not.toThrow();
  });
});
