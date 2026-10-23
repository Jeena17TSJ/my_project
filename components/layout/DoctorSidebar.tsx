'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FaTooth, FaTachometerAlt, FaCalendarCheck, FaUserInjured, FaFileMedical, FaSignOutAlt, FaLock } from 'react-icons/fa';

const navItems = [
  { href: '/doctor', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { href: '/doctor/appointments', icon: <FaCalendarCheck />, label: 'My Appointments' },
  { href: '/doctor/patients', icon: <FaUserInjured />, label: 'My Patients' },
  { href: '/doctor/records', icon: <FaFileMedical />, label: 'Medical Records' },
  { href: '/doctor/settings', icon: <FaLock />, label: 'Change Password' },
];

export default function DoctorSidebar() {
  const path = usePathname();
  const { data: session } = useSession();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const doctorName = doctorProfile?.name || session?.user?.name || 'Doctor';
  const logout = () => { window.location.href = '/api/auth/logout?callbackUrl=/'; };

  useEffect(() => {
    let mounted = true;

    const loadDoctorProfile = async () => {
      try {
        const res = await fetch('/api/doctors/me', { cache: 'no-store' });
        const data = await res.json();
        if (mounted) setDoctorProfile(data.doctor || null);
      } catch {
        if (mounted) setDoctorProfile(null);
      }
    };

    loadDoctorProfile();
    return () => { mounted = false; };
  }, []);

  return (
    <aside className="w-64 bg-brand-900 text-brand-100 shadow-xl shadow-brand-900/20 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-mint-300/15">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-900 ring-2 ring-mint-300/80">
          <FaTooth className="text-lg" />
        </span>
        <div className="min-w-0">
          <span className="block font-bold text-white">Doctor Portal</span>
          <span className="block truncate text-xs text-brand-100/75">{doctorName}</span>
        </div>
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
        <div className="mb-3 rounded-lg bg-brand-800/70 px-3 py-2">
          <p className="truncate text-sm font-semibold text-white">{doctorName}</p>
          {doctorProfile?.specialization && (
            <p className="truncate text-xs text-brand-100/75">{doctorProfile.specialization}</p>
          )}
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-200 text-sm font-semibold hover:bg-red-500/10 hover:text-white">
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </aside>
  );
}
