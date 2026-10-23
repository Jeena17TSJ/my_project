'use client';
import { useEffect, useState } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'View Dashboard', 'Manage Users', 'Manage Doctors', 'Manage Patients',
    'Manage Appointments', 'View Medical Records', 'Edit Medical Records',
    'Manage Clinic Settings', 'Send Communications', 'View Reports', 'Manage Roles',
  ],
  doctor: [
    'View Dashboard', 'View Own Appointments', 'View Assigned Patients',
    'Create Medical Records', 'Edit Own Medical Records',
  ],
  patient: [
    'View Own Profile', 'View Own Appointments', 'Book Appointments',
    'Cancel Own Appointments', 'View Own Medical Records',
  ],
  staff: [
    'View Dashboard', 'View Appointments', 'Manage Appointments',
    'View Patients',
  ],
};

const ROLE_COLORS: Record<string, string> = {
  admin:   'bg-purple-100 border-purple-300',
  doctor:  'bg-blue-100 border-blue-300',
  patient: 'bg-green-100 border-green-300',
  staff:   'bg-yellow-100 border-yellow-300',
};

const ROLE_BADGE: Record<string, string> = {
  admin:   'bg-purple-600',
  doctor:  'bg-blue-600',
  patient: 'bg-green-600',
  staff:   'bg-yellow-600',
};

export default function AdminRolesPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || []));
  }, []);

  const updateRole = async (id: string, role: string) => {
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
    toast.success('Role updated!');
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <FaShieldAlt className="text-blue-600 text-2xl" />
        <h1 className="text-2xl font-bold text-gray-800">Roles & Permissions</h1>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
          <div key={role} className={`rounded-2xl border-2 p-5 ${ROLE_COLORS[role]}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`${ROLE_BADGE[role]} text-white text-xs px-2 py-1 rounded font-medium capitalize`}>
                {role}
              </span>
              <span className="text-xs text-gray-500">{users.filter(u => u.role === role).length} users</span>
            </div>
            <ul className="space-y-1">
              {perms.map(p => (
                <li key={p} className="flex items-center gap-1.5 text-xs text-gray-700">
                  <span className="text-green-500">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* User Role Assignment */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-800">User Role Assignment</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['User', 'Email', 'Current Role', 'Change Role'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u: any) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`${ROLE_BADGE[u.role]} text-white text-xs px-2 py-1 rounded font-medium capitalize`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select value={u.role}
                    onChange={e => updateRole(u._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.keys(ROLE_PERMISSIONS).map(r => (
                      <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
