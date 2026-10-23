'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaTooth, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = () => { window.location.href = '/api/auth/logout?callbackUrl=/'; };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
    { href: '/appointment', label: 'Book Appointment' },
  ];

  const dashboardLink = session?.user
    ? `/${(session.user as any).role}`
    : '/login';

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/90 shadow-[0_10px_30px_rgba(1,37,125,0.12)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-brand-900 font-bold text-xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-white shadow-sm shadow-mint-200 ring-2 ring-mint-300/80">
              <FaTooth className="text-xl" />
            </span>
            <span className="tracking-tight">DentalCare</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className="rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-mint-50 hover:text-brand-900">
                {l.label}
              </Link>
            ))}
            {session ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardLink}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-900">
                  <FaUserCircle /> Dashboard
                </Link>
                <button onClick={logout}
                  className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login"
                  className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-mint-50">
                  Login
                </Link>
                <Link href="/register"
                  className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-800">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="rounded-lg p-2 text-brand-900 hover:bg-mint-50 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-brand-100 px-4 py-4 flex flex-col gap-2">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-slate-700 font-semibold hover:bg-mint-50 hover:text-brand-900">{l.label}</Link>
          ))}
          {session ? (
            <>
              <Link href={dashboardLink} onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-brand-900 font-semibold hover:bg-mint-50">Dashboard</Link>
              <button onClick={logout}
                className="rounded-lg px-3 py-2 text-red-600 text-left font-semibold hover:bg-red-50">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-brand-900 font-semibold hover:bg-mint-50">Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-lg bg-brand-900 px-3 py-2 text-white font-semibold">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
