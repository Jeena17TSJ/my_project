'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaEnvelope, FaMobile, FaBell } from 'react-icons/fa';

export default function AdminCommunicationPage() {
  const [patients, setPatients]   = useState<any[]>([]);
  const [sending,  setSending]    = useState(false);
  const [tab, setTab]             = useState<'email' | 'sms' | 'notification'>('notification');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetch('/api/patients').then(r => r.json()).then(d => setPatients(d.patients || []));
  }, []);

  const onSubmit = async (data: any) => {
    setSending(true);
    try {
      if (tab === 'notification') {
        const targets = data.target === 'all'
          ? patients.map((p: any) => p.userId?._id).filter(Boolean)
          : [data.userId];

        await Promise.all(targets.map((userId: string) =>
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              title: data.title,
              message: data.message,
              type: data.type || 'general',
            }),
          })
        ));
        toast.success(`Notification sent to ${targets.length} user(s)!`);
      } else {
        toast.success(`${tab === 'email' ? 'Email' : 'SMS'} feature coming soon!`);
      }
      reset();
    } catch {
      toast.error('Failed to send.');
    } finally {
      setSending(false); }
  };

  const tabs = [
    { key: 'notification', label: 'In-App Notification', icon: <FaBell /> },
    { key: 'email',        label: 'Email Blast',         icon: <FaEnvelope /> },
    { key: 'sms',          label: 'SMS Blast',           icon: <FaMobile /> },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Communication System</h1>

      {/* Tabs */}
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

      <form onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">

        {/* Target Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
          <select {...register('target')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Patients</option>
            <option value="specific">Specific Patient</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Or Select Patient</label>
          <select {...register('userId')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Choose patient —</option>
            {patients.map((p: any) => (
              <option key={p._id} value={p.userId?._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {tab === 'notification' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select {...register('type')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="general">General</option>
              <option value="reminder">Reminder</option>
              <option value="appointment">Appointment</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {tab === 'email' ? 'Subject' : 'Title'} *
          </label>
          <input {...register('title', { required: true })}
            placeholder={tab === 'email' ? 'Email subject line' : 'Notification title'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea {...register('message', { required: true })} rows={4}
            placeholder="Type your message here..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button type="submit" disabled={sending}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 text-sm">
          <FaPaperPlane size={13} /> {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
