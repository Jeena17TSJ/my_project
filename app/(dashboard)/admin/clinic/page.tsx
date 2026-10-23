'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaHospital, FaSave } from 'react-icons/fa';
import { PageLoader } from '@/components/ui/Spinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminClinicPage() {
  const [loading, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetch('/api/clinic').then(r => r.json()).then(d => {
      if (d.clinic) reset(d.clinic);
      setFetching(false);
    });
  }, []);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/clinic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Clinic settings saved!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return <PageLoader />;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <FaHospital className="text-blue-600 text-2xl" />
        <h1 className="text-2xl font-bold text-gray-800">Clinic Settings</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
              <input {...register('name')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea {...register('address')} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
            <textarea {...register('about')} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Working Hours</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
              <input {...register('openTime')} type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
              <input {...register('closeTime')} type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Open Days</label>
            <div className="flex flex-wrap gap-3">
              {DAYS.map(day => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value={day} {...register('openDays')}
                    className="rounded text-blue-600 w-4 h-4" />
                  <span className="text-sm text-gray-700">{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Social Links</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { key: 'socialLinks.facebook',  label: 'Facebook URL',  placeholder: 'https://facebook.com/...' },
              { key: 'socialLinks.instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
              { key: 'socialLinks.twitter',   label: 'Twitter URL',   placeholder: 'https://twitter.com/...' },
            ].map(s => (
              <div key={s.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
                <input {...register(s.key as any)} placeholder={s.placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
