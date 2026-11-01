// utils/roleHelpers.ts
import { UserRole } from '@app/types/userRole';

/**
 * Checks whether the user's role is among the allowed roles
 */
export const hasRequiredRole = (
  userRole: UserRole | null | undefined,
  allowedRoleNames: string[]
): boolean => {
  if (!userRole) return false;
  return allowedRoleNames.includes(userRole.name);
};

/**
 * Returns the UserRole objects for the given role names
 */
export const getRolesByNames = (
  roleNames: string[],
  allRoles: UserRole[]
): UserRole[] => {
  return allRoles.filter(role => roleNames.includes(role.name));
};

export const canManageUser = (
  actingRank: number | null | undefined,
  targetRank: number | null | undefined,
): boolean => {
  return (actingRank ?? 0) >= (targetRank ?? 0);
};