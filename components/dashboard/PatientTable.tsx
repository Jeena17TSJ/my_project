'use client';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import Avatar from '@/components/ui/Avatar';

interface PatientTableProps {
  patients:  any[];
  onView?:   (p: any) => void;
  onEdit?:   (p: any) => void;
  onDelete?: (id: string) => void;
}

export default function PatientTable({
  patients, onView, onEdit, onDelete,
}: PatientTableProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Patient','Phone','Email','Gender','Blood','Status','Actions'].map(h => (
                <th key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500
                             uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No patients found.
                </td>
              </tr>
            ) : patients.map((p: any) => (
              <tr key={p._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} size="sm" />
                    <span className="font-medium text-gray-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{p.email || '—'}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{p.gender || '—'}</td>
                <td className="px-4 py-3">
                  {p.bloodGroup
                    ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">{p.bloodGroup}</span>
                    : <span className="text-gray-400">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    p.userId?.isActive !== false
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {p.userId?.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {onView && (
                      <button onClick={() => onView(p)}
                        className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition"
                        title="View">
                        <FaEye size={11} />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(p)}
                        className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-yellow-100 hover:text-yellow-600 transition"
                        title="Edit">
                        <FaEdit size={11} />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(p._id)}
                        className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition"
                        title="Delete">
                        <FaTrash size={11} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
