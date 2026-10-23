import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user        = session?.user as any;
  const isLoading   = status === 'loading';
  const isLoggedIn  = status === 'authenticated';
  const role        = user?.role as string | undefined;

  const isAdmin   = role === 'admin';
  const isDoctor  = role === 'doctor';
  const isPatient = role === 'patient';
  const isStaff   = role === 'staff';

  const requireAuth = useCallback(
    (redirectTo = '/login') => {
      if (!isLoading && !isLoggedIn) router.push(redirectTo);
    },
    [isLoading, isLoggedIn, router]
  );

  const requireRole = useCallback(
    (requiredRole: string | string[], redirectTo = '/') => {
      if (isLoading) return;
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!isLoggedIn || !roles.includes(role || '')) router.push(redirectTo);
    },
    [isLoading, isLoggedIn, role, router]
  );

  const dashboardPath = useCallback(() => {
    switch (role) {
      case 'admin':   return '/admin';
      case 'doctor':  return '/doctor';
      case 'patient': return '/patient';
      default:        return '/';
    }
  }, [role]);

  const logout = useCallback(
    () => { window.location.href = '/api/auth/logout?callbackUrl=/'; },
    []
  );

  return {
    user,
    session,
    isLoading,
    isLoggedIn,
    role,
    isAdmin,
    isDoctor,
    isPatient,
    isStaff,
    requireAuth,
    requireRole,
    dashboardPath,
    logout,
  };
}

