'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FaCog, FaLock, FaBell, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<'profile' | 'password' | 'notifications'>('profile');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      phone: '',
    },
  });

  const onProfileSave = async (data: any) => {
    toast.success('Profile updated!');
  };

  const onPasswordSave = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || 'Failed to change password.');
      return;
    }

    toast.success(result.message || 'Password changed!');
  };

  const togglePassword = (key: string) => {
    setVisiblePasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { key: 'profile',       icon: <FaCog />,   label: 'Profile' },
    { key: 'password',      icon: <FaLock />,  label: 'Password' },
    { key: 'notifications', icon: <FaBell />,  label: 'Notifications' },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSubmit(onProfileSave)}
          className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-700 mb-2">Profile Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input {...register('name')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            Save Profile
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handleSubmit(onPasswordSave)}
          className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-700 mb-2">Change Password</h2>
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword',     label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <div className="relative">
                <input
                  {...register(f.key as any)}
                  type={visiblePasswords[f.key] ? 'text' : 'password'}
                  required
                  minLength={f.key === 'currentPassword' ? undefined : 8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => togglePassword(f.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={visiblePasswords[f.key] ? `Hide ${f.label}` : `Show ${f.label}`}
                >
                  {visiblePasswords[f.key] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            Update Password
          </button>
        </form>
      )}

      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-700 mb-4">Notification Preferences</h2>
          {[
            { label: 'New appointment booked',     key: 'newAppointment' },
            { label: 'Appointment status changes', key: 'statusChange' },
            { label: 'New patient registered',     key: 'newPatient' },
            { label: 'Daily summary report',       key: 'dailySummary' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer">
              <span className="text-sm text-gray-700">{item.label}</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 w-3.5 h-3.5" />
                  Email
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 w-3.5 h-3.5" />
                  In-App
                </label>
              </div>
            </label>
          ))}
          <button onClick={() => toast.success('Preferences saved!')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 mt-2">
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}
