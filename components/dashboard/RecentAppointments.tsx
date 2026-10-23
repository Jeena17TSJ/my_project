import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100   text-blue-700',
  completed: 'bg-green-100  text-green-700',
  cancelled: 'bg-red-100    text-red-700',
};

interface RecentAppointmentsProps {
  appointments: any[];
  showLink?: boolean;
  linkHref?: string;
}

export default function RecentAppointments({
  appointments,
  showLink = true,
  linkHref = '/admin/appointments',
}: RecentAppointmentsProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="font-bold text-gray-800">Recent Appointments</h2>
        {showLink && (
          <Link href={linkHref}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all →
          </Link>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          No appointments yet.
        </div>
      ) : (
        <div className="divide-y">
          {appointments.slice(0, 6).map((a: any) => (
            <div key={a._id}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center
                                text-blue-600 text-sm font-bold flex-shrink-0">
                  {a.patientName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{a.patientName}</p>
                  <p className="text-xs text-gray-500">
                    {a.service} · {a.doctorName}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[a.status]}`}>
                  {a.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(a.date).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short',
                  })} · {a.timeSlot}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
