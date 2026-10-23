'use client';
import { useEffect, useState } from 'react';
import {
  FaUsers, FaCalendarCheck, FaUserMd,
  FaClock, FaCheckCircle,
} from 'react-icons/fa';
import StatsCard           from '@/components/dashboard/StatsCard';
import RecentAppointments  from '@/components/dashboard/RecentAppointments';
import ActivityFeed        from '@/components/dashboard/ActivityFeed';
import NotificationBell    from '@/components/dashboard/NotificationBell';
import { PageLoader }      from '@/components/ui/Spinner';
import { useSession }      from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const user = (session?.user as any);

  const [stats,        setStats]        = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/reports').then(r => r.json()),
      fetch('/api/appointments').then(r => r.json()),
    ]).then(([reportData, apptData]) => {
      setStats(reportData);
      setAppointments(apptData.appointments || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader />;

  // Build activity feed from recent appointments
  const activityItems = appointments.slice(0, 8).map((a: any) => ({
    id:      a._id,
    type:    'appointment' as const,
    message: `${a.patientName} booked ${a.service} with ${a.doctorName || 'doctor'}`,
    time:    new Date(a.createdAt || a.date).toLocaleDateString('en-IN', {
               day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
             }),
  }));

  const todayAppts = appointments.filter(
    a => new Date(a.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <NotificationBell userId={user?.id} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="xl:col-span-2">
          <StatsCard
            icon={<FaUsers />}
            label="Total Patients"
            value={stats?.totalPatients ?? 0}
            color="blue"
            change="12%"
            up
          />
        </div>
        <div className="xl:col-span-2">
          <StatsCard
            icon={<FaCalendarCheck />}
            label="Appointments"
            value={stats?.totalAppointments ?? 0}
            color="green"
            change="8%"
            up
          />
        </div>
        <div className="xl:col-span-2">
          <StatsCard
            icon={<FaUserMd />}
            label="Active Doctors"
            value={stats?.totalDoctors ?? 0}
            color="purple"
          />
        </div>
        <div className="xl:col-span-2">
          <StatsCard
            icon={<FaClock />}
            label="Today's Appointments"
            value={todayAppts.length}
            color="blue"
          />
        </div>
        <div className="xl:col-span-2">
          <StatsCard
            icon={<FaCheckCircle />}
            label="Completed"
            value={stats?.statusBreakdown?.completed ?? 0}
            color="green"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Appointments by Status</h2>
          <div className="space-y-3">
            {(stats?.appointmentsByStatus || []).map((s: any) => {
              const total = stats?.totalAppointments || 1;
              const pct   = Math.round((s.count / total) * 100);
              const colorMap: Record<string, string> = {
                pending:   'bg-yellow-400',
                confirmed: 'bg-blue-500',
                completed: 'bg-green-500',
                cancelled: 'bg-red-400',
              };
              return (
                <div key={s._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{s._id}</span>
                    <span className="font-semibold text-gray-800">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorMap[s._id] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAppointments appointments={appointments} />
        <ActivityFeed items={activityItems} />
      </div>
    </div>
  );
}
