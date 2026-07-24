export function uniqueMayarEmail(userEmail: string, entitlementId: string): string {
  const at = userEmail.indexOf("@");
  if (at === -1) {
    throw new Error("Invalid email");
  }
  const local = userEmail.slice(0, at);
  const domain = userEmail.slice(at + 1);
  return `${local}+${entitlementId}@${domain}`;
}
