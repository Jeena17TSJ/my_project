'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FaCalendarCheck, FaUserInjured, FaCheckCircle } from 'react-icons/fa';

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const profileRes = await fetch('/api/doctors/me', { cache: 'no-store' });
        const profileData = await profileRes.json();

        const doctorId = profileData.doctor?._id;
        const appointmentsRes = await fetch(
          doctorId ? `/api/doctors/${doctorId}/appointments` : '/api/appointments',
          { cache: 'no-store' }
        );
        const data = await appointmentsRes.json();

        setAppointments(data.appointments || []);
        setDoctorProfile(profileData.doctor || null);
      } catch (e) {
        console.error('Failed to load doctor dashboard:', e);
        setAppointments([]);
        setDoctorProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const today = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString());
  const pending = appointments.filter(a => a.status === 'pending');
  const completed = appointments.filter(a => a.status === 'completed');
  const doctorName = doctorProfile?.name || session?.user?.name || 'Doctor';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Doctor Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">
        Welcome back, <span className="font-semibold text-gray-700">{doctorName}</span>
        {doctorProfile?.specialization && (
          <span className="text-blue-600"> — {doctorProfile.specialization}</span>
        )}
      </p>
      {loading && <p className="text-gray-400 text-sm mb-4">Loading your appointments...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: <FaCalendarCheck className="text-blue-500 text-2xl" />, label: "Today's Appointments", value: today.length, bg: 'bg-blue-50' },
          { icon: <FaUserInjured className="text-yellow-500 text-2xl" />, label: 'Pending', value: pending.length, bg: 'bg-yellow-50' },
          { icon: <FaCheckCircle className="text-green-500 text-2xl" />, label: 'Completed', value: completed.length, bg: 'bg-green-50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-6 flex items-center gap-4`}>
            {c.icon}
            <div>
              <div className="text-2xl font-bold text-gray-800">{c.value}</div>
              <div className="text-gray-600 text-sm">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Today&apos;s Schedule</h2>
        {today.length === 0 ? (
          <p className="text-gray-400 text-sm">No appointments scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {today.map((a: any) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{a.patientName}</p>
                  <p className="text-gray-500 text-xs">{a.service} at {a.timeSlot}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
