// dental-clinic\components\appointment\AppointmentTable.tsx
'use client';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100   text-blue-700',
  completed: 'bg-green-100  text-green-700',
  cancelled: 'bg-red-100    text-red-700',
};

interface AppointmentTableProps {
  appointments: any[];
  onConfirm?:   (id: string) => void;
  onCancel?:    (id: string) => void;
  onComplete?:  (id: string) => void;
  onView?:      (appt: any) => void;
  showPatient?: boolean;
  showDoctor?:  boolean;
}

export default function AppointmentTable({
  appointments,
  onConfirm, onCancel, onComplete, onView,
  showPatient = true, showDoctor = true,
}: AppointmentTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-12 text-center text-gray-400">
        No appointments found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-gray-50 border-b">
          <tr>
            {[
              showPatient && 'Patient',
              showDoctor  && 'Doctor',
              'Service', 'Date', 'Time', 'Status', 'Via', 'Actions',
            ].filter(Boolean).map(h => (
              <th key={h as string}
                className="text-left px-4 py-3 text-gray-600 font-semibold text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map((a: any) => (
            <tr key={a._id} className="hover:bg-gray-50 transition">
              {showPatient && (
                <td className="px-4 py-3 font-medium text-gray-800">{a.patientName}</td>
              )}
              {showDoctor && (
                <td className="px-4 py-3 text-gray-600 text-xs">{a.doctorName || '—'}</td>
              )}
              <td className="px-4 py-3 text-gray-700">{a.service}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {new Date(a.date).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.timeSlot}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                  {a.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs capitalize">{a.bookedVia || '—'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {onView && (
                    <button onClick={() => onView(a)}
                      className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition"
                      title="View">
                      <FaEye size={11} />
                    </button>
                  )}
                  {onConfirm && a.status === 'pending' && (
                    <button onClick={() => onConfirm(a._id)}
                      className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                      title="Confirm">
                      <FaCheck size={11} />
                    </button>
                  )}
                  {onComplete && a.status === 'confirmed' && (
                    <button onClick={() => onComplete(a._id)}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg
                                 hover:bg-blue-200 transition text-xs font-medium">
                      Done
                    </button>
                  )}
                  {onCancel && ['pending','confirmed'].includes(a.status) && (
                    <button onClick={() => onCancel(a._id)}
                      className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition"
                      title="Cancel">
                      <FaTimes size={11} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
