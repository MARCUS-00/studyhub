// Shared password policy — used server-side in signup and reset-password.
// Min 8 chars, at least one digit, at least one non-alphanumeric character.
export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) return "Password must be at least 8 characters.";
  if (!/\d/.test(password)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character.";
  return null;
}
