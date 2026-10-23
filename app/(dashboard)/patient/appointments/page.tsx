'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCalendarCheck, FaPlus, FaTimes } from 'react-icons/fa';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [confirm,  setConfirm]  = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [filter,   setFilter]   = useState('all');

  const fetchAppointments = () => {
    setLoading(true);
    const url = filter !== 'all' ? `/api/appointments?status=${filter}` : '/api/appointments';
    fetch(url).then(r => r.json()).then(d => {
      setAppointments(d.appointments || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const handleCancel = async () => {
    if (!cancelId) return;
    await fetch(`/api/appointments/${cancelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    toast.success('Appointment cancelled.');
    setConfirm(false);
    fetchAppointments();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
        <Link href="/appointment"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <FaPlus /> Book New
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        appointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <FaCalendarCheck className="text-5xl mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">No appointments found.</p>
            <Link href="/appointment"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700">
              Book an Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((a: any) => (
              <div key={a._id} className="bg-white rounded-2xl border shadow-sm p-5 flex items-center justify-between hover:shadow-md transition">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                    🦷
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{a.service}</p>
                    <p className="text-sm text-gray-500">{a.doctorName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">📅 {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-xs text-gray-400">🕐 {a.timeSlot}</span>
                      {a.fee && <span className="text-xs text-green-600 font-medium">₹{a.fee.toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                  {(a.status === 'pending' || a.status === 'confirmed') && (
                    <button
                      onClick={() => { setCancelId(a._id); setConfirm(true); }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Cancel">
                      <FaTimes size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        isOpen={confirm} title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? Please ensure you cancel at least 24 hours in advance."
        confirmLabel="Yes, Cancel" variant="warning"
        onConfirm={handleCancel}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
