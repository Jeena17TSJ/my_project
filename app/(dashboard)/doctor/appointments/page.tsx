'use client';
import { useEffect, useState } from 'react';
import { FaCalendarCheck, FaCheck } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import MedicalRecordForm from '@/components/forms/MedicalRecordForm';
import { PageLoader } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [showRecord, setShowRecord] = useState(false);
  const [activeAppt, setActiveAppt] = useState<any>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const profileRes = await fetch('/api/doctors/me', { cache: 'no-store' });
      const profileData = await profileRes.json();
      const doctorId = profileData.doctor?._id;
      const statusQuery = filter !== 'all' ? `?status=${filter}` : '';
      const url = doctorId
        ? `/api/doctors/${doctorId}/appointments${statusQuery}`
        : `/api/appointments${statusQuery}`;

      const res = await fetch(url, { cache: 'no-store' });
      const d = await res.json();
      setAppointments(d.appointments || []);
    } catch (e) {
      console.error('Failed to load doctor appointments:', e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const markCompleted = async (id: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    toast.success('Marked as completed');
    fetchAppointments();
  };

  const openRecord = (appt: any) => { setActiveAppt(appt); setShowRecord(true); };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h1>

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

      {loading ? <PageLoader /> : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <FaCalendarCheck className="text-5xl mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No appointments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a: any) => (
            <div key={a._id} className="bg-white rounded-2xl border shadow-sm p-5 flex items-center justify-between hover:shadow-md transition">
              <div className="flex gap-4 items-center">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-sm font-bold">
                  {a.patientName?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{a.patientName}</p>
                  <p className="text-sm text-gray-500">{a.service}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-400">📅 {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span className="text-xs text-gray-400">🕐 {a.timeSlot}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                  {a.status}
                </span>
                {a.status === 'confirmed' && (
                  <>
                    <button onClick={() => markCompleted(a._id)}
                      className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition">
                      <FaCheck size={10} /> Complete
                    </button>
                    <button onClick={() => openRecord(a)}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition">
                      + Record
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showRecord} onClose={() => setShowRecord(false)}
        title="Add Medical Record" size="lg">
        <MedicalRecordForm
          initial={activeAppt ? {
            appointmentId: activeAppt._id,
            patientId: activeAppt.patientId?._id || activeAppt.patientId,
          } : undefined}
          onSuccess={() => { setShowRecord(false); toast.success('Record saved!'); }}
          onCancel={() => setShowRecord(false)}
        />
      </Modal>
    </div>
  );
}
