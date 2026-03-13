export function hasPermission(userPermissions: string[] | undefined, required: string | string[]): boolean {
  if (!userPermissions) return false;
  const req = Array.isArray(required) ? required : [required];
  return req.some(p => userPermissions.indexOf(p) !== -1);
}
