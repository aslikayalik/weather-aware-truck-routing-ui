import { useSelector } from '@store/store';
import { RootState } from '@store/store';

export function useCurrentUserId(): number | null {
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user) return null;
  // id may sometimes be a string; convert it to a number
  return user.id ? Number(user.id) : null;
}
