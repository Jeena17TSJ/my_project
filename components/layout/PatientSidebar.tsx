'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTooth, FaTachometerAlt, FaCalendarCheck, FaFileMedical, FaSignOutAlt } from 'react-icons/fa';

const navItems = [
  { href: '/patient', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { href: '/patient/appointments', icon: <FaCalendarCheck />, label: 'My Appointments' },
  { href: '/patient/records', icon: <FaFileMedical />, label: 'Medical Records' },
];

export default function PatientSidebar() {
  const path = usePathname();
  const logout = () => { window.location.href = '/api/auth/logout?callbackUrl=/'; };

  return (
    <aside className="w-64 bg-brand-900 text-brand-100 shadow-xl shadow-brand-900/20 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-mint-300/15">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-900 ring-2 ring-mint-300/80">
          <FaTooth className="text-lg" />
        </span>
        <span className="font-bold text-white">Patient Portal</span>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`mx-3 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
              path === item.href ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-100/75 hover:bg-brand-800 hover:text-white'
            }`}>
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-mint-300/15">
        <button onClick={logout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-200 text-sm font-semibold hover:bg-red-500/10 hover:text-white">
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </aside>
  );
}
