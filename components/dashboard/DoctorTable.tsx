'use client';
import { FaEdit, FaTrash, FaStar, FaUserMd } from 'react-icons/fa';

interface DoctorTableProps {
  doctors:   any[];
  onEdit?:   (d: any) => void;
  onDelete?: (id: string) => void;
}

export default function DoctorTable({ doctors, onEdit, onDelete }: DoctorTableProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Doctor','Specialization','Experience','Fee','Rating','Available Days','Actions'].map(h => (
                <th key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {doctors.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No doctors added yet.
                </td>
              </tr>
            ) : doctors.map((d: any) => (
              <tr key={d._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUserMd className="text-blue-600" size={13} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.qualification}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{d.specialization}</td>
                <td className="px-4 py-3 text-gray-600">{d.experience} yrs</td>
                <td className="px-4 py-3 text-green-700 font-medium">
                  ₹{d.consultationFee?.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" size={12} />
                    <span className="text-gray-700">{d.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.availableDays?.slice(0, 3).map((day: string) => (
                      <span key={day}
                        className="bg-blue-50 text-blue-600 text-xs px-1.5 py-0.5 rounded">
                        {day.slice(0, 3)}
                      </span>
                    ))}
                    {d.availableDays?.length > 3 && (
                      <span className="text-gray-400 text-xs">+{d.availableDays.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <button onClick={() => onEdit(d)}
                        className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition"
                        title="Edit">
                        <FaEdit size={11} />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(d._id)}
                        className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition"
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
