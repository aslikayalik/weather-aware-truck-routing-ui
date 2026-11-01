// hooks/useRoleCheck.ts
import { useSelector } from 'react-redux';
import { hasRequiredRole } from '@app/utils/roleHelpers';
import { RootState } from '@app/store/store';

/**
 * Checks inside a component whether the user has any of the given roles
 */
export const useRoleCheck = (requiredRoles: string[]): boolean => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user?.role_detail) return false;

  return hasRequiredRole(user.role_detail, requiredRoles);
};

// Usage example:
// const isAdmin = useRoleCheck(['admin']);
// return isAdmin ? <AdminButton /> : null;