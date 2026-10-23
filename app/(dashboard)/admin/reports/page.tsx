'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  FaUsers, FaCalendarCheck, FaUserMd,
  FaExclamationTriangle, FaDownload,
} from 'react-icons/fa';
import { PageLoader } from '@/components/ui/Spinner';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sep','Oct','Nov','Dec'];

const PIE_COLORS = ['#f59e0b','#3b82f6','#22c55e','#ef4444'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const ApptTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-800">{payload[0].value} appointments</p>
    </div>
  );
};

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const apptData = (data?.appointmentsByMonth || []).map((r: any) => ({
    month: `${MONTH_NAMES[r._id.month - 1]} ${r._id.year}`,
    count: r.count,
  }));

  const pieData = (data?.appointmentsByStatus || []).map((s: any) => ({
    name: STATUS_LABELS[s._id] || s._id,
    value: s.count,
  }));

  const kpiCards = [
    {
      icon: <FaUsers />,
      label: 'Total Patients',
      value: data?.totalPatients ?? 0,
      sub: 'Registered',
      color: 'blue',
    },
    {
      icon: <FaCalendarCheck />,
      label: 'Total Appointments',
      value: data?.totalAppointments ?? 0,
      sub: `${data?.statusBreakdown?.completed ?? 0} completed`,
      color: 'green',
    },
    {
      icon: <FaUserMd />,
      label: 'Active Doctors',
      value: data?.totalDoctors ?? 0,
      sub: 'Specialists',
      color: 'purple',
    },
    {
      icon: <FaExclamationTriangle />,
      label: 'Cancellations',
      value: data?.statusBreakdown?.cancelled ?? 0,
      sub: `of ${data?.totalAppointments ?? 0} total`,
      color: 'red',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  const iconBg: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of clinic appointments and patient activity
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-300 text-gray-600
                     px-4 py-2 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
        >
          <FaDownload size={13} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(card => (
          <div
            key={card.label}
            className={`rounded-2xl border p-5 flex items-center gap-4 ${colorMap[card.color]}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                             text-lg flex-shrink-0 ${iconBg[card.color]}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-gray-500 text-xs">{card.label}</p>
              <p className="text-2xl font-extrabold text-gray-800 mt-0.5">{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Monthly Appointments</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
              Count
            </span>
          </div>
          {apptData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No appointment data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={apptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }}
                       axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ApptTooltip />} />
                <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Appointments by Status</h2>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [v, 'Appointments']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5">Status Breakdown</h2>
          <div className="space-y-4">
            {[
              { key: 'pending', label: 'Pending', color: 'bg-yellow-400' },
              { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
              { key: 'completed', label: 'Completed', color: 'bg-green-500' },
              { key: 'cancelled', label: 'Cancelled', color: 'bg-red-400' },
            ].map(s => {
              const count = data?.statusBreakdown?.[s.key] ?? 0;
              const total = data?.totalAppointments || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={s.key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 font-medium">{s.label}</span>
                    <span className="text-gray-800 font-bold">
                      {count}
                      <span className="text-gray-400 font-normal ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${s.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Appointments</h2>
          <span className="text-xs text-gray-400">Last 10 records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Patient','Service','Doctor','Date','Time','Status'].map(h => (
                  <th key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.recentAppointments || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No appointments yet.
                  </td>
                </tr>
              ) : (data?.recentAppointments || []).map((a: any) => (
                <tr key={a._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.patientName}</td>
                  <td className="px-4 py-3 text-gray-600">{a.service}</td>
                  <td className="px-4 py-3 text-gray-600">{a.doctorName || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(a.date).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.timeSlot}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      a.status === 'completed' ? 'bg-green-100 text-green-700' :
                      a.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
