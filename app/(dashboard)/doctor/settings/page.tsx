'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

export default function DoctorSettingsPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const setField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const togglePassword = (key: string) => {
    setVisiblePasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || 'Failed to change password.');
      return;
    }

    toast.success(data.message || 'Password changed successfully.');
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <FaLock />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
          <p className="text-sm text-gray-500">Update your doctor portal sign-in password.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        {[
          { key: 'currentPassword', label: 'Current Password' },
          { key: 'newPassword', label: 'New Password' },
          { key: 'confirmPassword', label: 'Confirm New Password' },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            <div className="relative">
              <input
                type={visiblePasswords[field.key] ? 'text' : 'password'}
                value={form[field.key as keyof typeof form]}
                onChange={e => setField(field.key as keyof typeof form, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={field.key === 'currentPassword' ? undefined : 8}
              />
              <button
                type="button"
                onClick={() => togglePassword(field.key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={visiblePasswords[field.key] ? `Hide ${field.label}` : `Show ${field.label}`}
              >
                {visiblePasswords[field.key] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
