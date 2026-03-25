export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  permissions: string[];
}

export const hasPermission = (permissions: string[] | undefined, required: string[]) => {
  if (!required || required.length === 0) return true;
  if (!permissions) return false;
  return required.every(p => permissions.includes(p));
};
