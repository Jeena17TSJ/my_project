'use client';
import { useSession }  from 'next-auth/react';
import { useRouter }   from 'next/navigation';
import { useEffect }   from 'react';
import Spinner         from '@/components/ui/Spinner';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { FaTooth }     from 'react-icons/fa';

interface DashboardLayoutProps {
  children:      React.ReactNode;
  sidebar:       React.ReactNode;
  requiredRole?: string | string[];
  title?:        string;
}

export default function DashboardLayout({
  children, sidebar, requiredRole, title,
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role   = (session?.user as any)?.role;
  const user   = session?.user as any;

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (requiredRole) {
      const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowed.includes(role)) router.replace('/');
    }
  }, [status, role, requiredRole, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <FaTooth className="text-brand-900 text-4xl animate-pulse" />
          </div>
          <Spinner size="lg" />
          <p className="text-gray-400 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="flex min-h-screen bg-brand-50/70">
      {/* Sidebar */}
      <div className="flex-shrink-0">{sidebar}</div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-brand-100 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-[0_8px_24px_rgba(1,37,125,0.08)]">
          <div>
            {title && (
              <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell userId={user?.id} />
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center
                              text-white text-sm font-bold">
                {user?.name?.charAt(0) || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-brand-900 capitalize">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,#f7faff_0%,#ecffff_100%)]">{children}</main>
      </div>
    </div>
  );
}
