'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCalendarCheck, FaFileMedical, FaPlus } from 'react-icons/fa';

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/appointments').then(r => r.json()).then(d => setAppointments(d.appointments?.slice(0, 5) || []));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {session?.user?.name}!</h1>
          <p className="text-gray-500 text-sm">Manage your dental health from one place</p>
        </div>
        <Link href="/appointment"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <FaPlus /> Book Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { icon: <FaCalendarCheck className="text-blue-500 text-2xl" />, label: 'Appointments', href: '/patient/appointments', bg: 'bg-blue-50', count: appointments.length },
          { icon: <FaFileMedical className="text-green-500 text-2xl" />, label: 'Medical Records', href: '/patient/records', bg: 'bg-green-50', count: 0 },
        ].map(c => (
          <Link key={c.label} href={c.href}
            className={`${c.bg} rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition`}>
            {c.icon}
            <div>
              <div className="text-2xl font-bold text-gray-800">{c.count}</div>
              <div className="text-gray-600 text-sm">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Appointments</h2>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaCalendarCheck className="text-4xl mx-auto mb-2 opacity-30" />
            <p>No appointments yet.</p>
            <Link href="/appointment" className="text-blue-600 text-sm mt-1 block">Book your first appointment →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a: any) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{a.service}</p>
                  <p className="text-gray-500 text-xs">{a.doctorName} • {new Date(a.date).toLocaleDateString('en-IN')} at {a.timeSlot}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  a.status === 'completed' ? 'bg-green-100 text-green-700' :
                  a.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
