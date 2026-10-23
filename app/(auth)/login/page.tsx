// dental-clinic\app\(auth)\login\page.tsx
'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaTooth } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const role = (session?.user as any)?.role;
    const destination =
      role === 'admin' ? '/admin' :
      role === 'doctor' ? '/doctor' :
      role === 'patient' ? '/patient' :
      '/';
    router.push(destination);
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { email: email.trim(), password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password');
      return;
    }
    // role-based redirect will happen automatically once session is authenticated
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="clinic-card w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm shadow-blue-200">
            <FaTooth className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Sign in to your DentalCare account</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 focus:outline-none" required />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 pr-11 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="clinic-button w-full py-2.5 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Don&apos;t have an account? <Link href="/register" className="font-semibold text-blue-700">Register</Link>
        </p>
      </div>
    </div>
  );
}
