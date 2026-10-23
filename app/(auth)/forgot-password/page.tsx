'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaTooth } from 'react-icons/fa';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'patient', label: 'Patient' },
];

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({
    role: 'patient',
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePassword = (key: string) => {
    setVisiblePasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: form.role,
        email: form.email,
        newPassword: form.newPassword,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Failed to reset password.');
      return;
    }

    setMessage(data.message || 'Password reset successfully.');
    setForm(prev => ({ ...prev, email: '', newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="clinic-card w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm shadow-blue-200">
            <FaTooth className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Forgot Password</h1>
          <p className="text-slate-500 text-sm">Reset your DentalCare account password</p>
        </div>

        {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Account Type</label>
            <select
              value={form.role}
              onChange={e => setField('role', e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 focus:outline-none"
              required
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">New Password</label>
            <div className="relative">
              <input
                type={visiblePasswords.newPassword ? 'text' : 'password'}
                value={form.newPassword}
                onChange={e => setField('newPassword', e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 pr-11 focus:outline-none"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => togglePassword('newPassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={visiblePasswords.newPassword ? 'Hide new password' : 'Show new password'}
              >
                {visiblePasswords.newPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={visiblePasswords.confirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => setField('confirmPassword', e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 pr-11 focus:outline-none"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => togglePassword('confirmPassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={visiblePasswords.confirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {visiblePasswords.confirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="clinic-button w-full py-2.5 disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Remember your password? <Link href="/login" className="font-semibold text-blue-700">Login</Link>
        </p>
      </div>
    </div>
  );
}
