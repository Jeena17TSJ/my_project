// dental-clinic\components\appointment\AppointmentCard.tsx
import { FaCalendarAlt, FaClock, FaUserMd, FaTooth } from 'react-icons/fa';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100   text-blue-700   border-blue-200',
  completed: 'bg-green-100  text-green-700  border-green-200',
  cancelled: 'bg-red-100    text-red-700    border-red-200',
};

interface AppointmentCardProps {
  appointment: any;
  actions?:    React.ReactNode;
}

export default function AppointmentCard({ appointment: a, actions }: AppointmentCardProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaTooth className="text-blue-600 text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{a.service}</h3>
            <p className="text-sm text-gray-500">{a.patientName}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${STATUS_STYLES[a.status]}`}>
          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaCalendarAlt className="text-blue-400 flex-shrink-0" size={13} />
          {new Date(a.date).toLocaleDateString('en-IN', {
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaClock className="text-blue-400 flex-shrink-0" size={13} />
          {a.timeSlot}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
          <FaUserMd className="text-blue-400 flex-shrink-0" size={13} />
          {a.doctorName || 'To be assigned'}
        </div>
      </div>

      {a.fee > 0 && (
        <div className="text-sm font-semibold text-green-700 mb-3">
          Fee: ₹{a.fee.toLocaleString('en-IN')}
        </div>
      )}

      {a.notes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-3 line-clamp-2">
          📝 {a.notes}
        </p>
      )}

      {actions && <div className="flex gap-2 pt-3 border-t">{actions}</div>}
    </div>
  );
}
