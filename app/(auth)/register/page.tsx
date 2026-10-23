'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaTooth } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'patient' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Registered! Please login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="clinic-card w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm shadow-blue-200">
            <FaTooth className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Create Account</h1>
          <p className="text-slate-500 text-sm">Join DentalCare today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone', type: 'tel' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-slate-700 block mb-1">{f.label}</label>
              {f.key === 'password' ? (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
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
              ) : (
                <input type={f.type} value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-lg px-4 py-2.5 focus:outline-none" required />
              )}
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="clinic-button w-full py-2.5 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link href="/login" className="font-semibold text-blue-700">Login</Link>
        </p>
      </div>
    </div>
  );
}
