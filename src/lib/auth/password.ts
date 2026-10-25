import bcrypt from "bcryptjs";

export class PasswordPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordPolicyError";
  }
}

export function assertStrongPassword(password: string): void {
  if (password.length < 14 || password.length > 128) {
    throw new PasswordPolicyError("Password must contain between 14 and 128 characters");
  }
  if (!/[a-z]/.test(password)) throw new PasswordPolicyError("Password must include a lowercase letter");
  if (!/[A-Z]/.test(password)) throw new PasswordPolicyError("Password must include an uppercase letter");
  if (!/\d/.test(password)) throw new PasswordPolicyError("Password must include a number");
  if (!/[^A-Za-z0-9]/.test(password)) throw new PasswordPolicyError("Password must include a symbol");
}

export async function hashPassword(password: string, rounds = 12): Promise<string> {
  assertStrongPassword(password);
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
