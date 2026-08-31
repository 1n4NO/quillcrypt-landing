const allowedReturnPaths = new Set(["/dashboard", "/dashboard/members", "/invite"]);

export function safeReturnPath(value: string | null | undefined) {
  return value && allowedReturnPaths.has(value) ? value : "/dashboard";
}
