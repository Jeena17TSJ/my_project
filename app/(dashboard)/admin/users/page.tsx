// // dental-clinic\app\(dashboard)\admin\users\page.tsx
// 'use client';
// import { useEffect, useState } from 'react';
// import { FaSearch, FaUserPlus } from 'react-icons/fa';
// import toast from 'react-hot-toast';

// const ROLE_COLORS: Record<string, string> = {
//   admin: 'bg-purple-100 text-purple-700',
//   doctor: 'bg-blue-100 text-blue-700',
//   patient: 'bg-green-100 text-green-700',
//   staff: 'bg-yellow-100 text-yellow-700',
// };

// export default function AdminUsersPage() {
//   const [users, setUsers] = useState<any[]>([]);
//   const [search, setSearch] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch('/api/users').then(r => r.json()).then(d => {
//       setUsers(d.users || []);
//       setLoading(false);
//     });
//   }, []);

//   const toggleActive = async (id: string, current: boolean) => {
//     await fetch(`/api/users/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ isActive: !current }),
//     });
//     setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !current } : u));
//     toast.success('User status updated');
//   };

//   const filtered = users.filter(u =>
//     u.name?.toLowerCase().includes(search.toLowerCase()) ||
//     u.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="p-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
//         <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
//           <FaUserPlus /> Add User
//         </button>
//       </div>

//       <div className="relative mb-6">
//         <FaSearch className="absolute left-3 top-3 text-gray-400" />
//         <input value={search} onChange={e => setSearch(e.target.value)}
//           placeholder="Search users..."
//           className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-400">Loading...</div>
//       ) : (
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50 border-b">
//               <tr>
//                 {['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
//                   <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {filtered.map((u: any) => (
//                 <tr key={u._id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
//                   <td className="px-4 py-3 text-gray-600">{u.email}</td>
//                   <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
//                   <td className="px-4 py-3">
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${ROLE_COLORS[u.role]}`}>{u.role}</span>
//                   </td>
//                   <td className="px-4 py-3">
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                       {u.isActive ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
//                   <td className="px-4 py-3">
//                     <button onClick={() => toggleActive(u._id, u.isActive)}
//                       className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
//                       {u.isActive ? 'Deactivate' : 'Activate'}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';
import { useEffect, useState } from 'react';
import {
  FaSearch, FaUserPlus, FaEdit,
  FaTimes, FaCheck, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// -- Types ----------------------------------------------------
interface User {
  _id:       string;
  name:      string;
  email:     string;
  phone?:    string;
  role:      string;
  isActive:  boolean;
  createdAt: string;
}

// -- Role config ----------------------------------------------
const ROLE_COLORS: Record<string, string> = {
  admin:   'bg-purple-100 text-purple-700',
  doctor:  'bg-blue-100   text-blue-700',
  patient: 'bg-green-100  text-green-700',
  staff:   'bg-yellow-100 text-yellow-700',
};

const ROLES = ['admin', 'patient', 'staff'];

// -- Add/Edit User Modal --------------------------------------
interface UserModalProps {
  user?:      User | null;
  onClose:    () => void;
  onSuccess:  () => void;
}

function UserModal({ user, onClose, onSuccess }: UserModalProps) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
    role:     user?.role     || 'patient',
    password: '',
    isActive: user?.isActive ?? true,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email';
    if (!isEdit && !form.password)
      e.password = 'Password is required for new users';
    if (form.password && form.password.length < 8)
      e.password = 'Password must be at least 8 characters';
    if (form.phone && !/^[0-9+\s\-()]{7,15}$/.test(form.phone))
      e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      let res: Response;

      if (isEdit) {
        // Edit existing user
        const body: any = {
          name:     form.name,
          phone:    form.phone,
          role:     form.role,
          isActive: form.isActive,
        };
        if (form.password) body.password = form.password;

        res = await fetch(`/api/users/${user!._id}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
      } else {
        // Create new user via register endpoint
        res = await fetch('/api/auth/register', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            name:     form.name,
            email:    form.email,
            password: form.password,
            phone:    form.phone,
            role:     form.role,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save user');
        return;
      }

      toast.success(isEdit ? 'User updated successfully!' : 'User created successfully!');
      onSuccess();
      onClose();

    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200
                       rounded-xl transition"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="John Doe"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none
                focus:ring-2 transition
                ${errors.name
                  ? 'border-red-300 focus:ring-red-400 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'}`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              value={form.email}
              onChange={e => set('email', e.target.value)}
              type="email"
              placeholder="user@dentalcare.in"
              disabled={isEdit}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none
                focus:ring-2 transition
                ${isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                ${errors.email
                  ? 'border-red-300 focus:ring-red-400 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'}`}
            />
            {isEdit && (
              <p className="text-gray-400 text-xs mt-1">
                Email cannot be changed after account creation
              </p>
            )}
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none
                focus:ring-2 transition
                ${errors.phone
                  ? 'border-red-300 focus:ring-red-400 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'}`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={form.role}
              onChange={e => set('role', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {ROLES.map(r => (
                <option key={r} value={r} className="capitalize">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password{' '}
              {isEdit ? (
                <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
              ) : (
                <span className="text-red-500">*</span>
              )}
            </label>
            <div className="relative">
              <input
                value={form.password}
                onChange={e => set('password', e.target.value)}
                type={showPass ? 'text' : 'password'}
                placeholder={isEdit ? '••••••••' : 'Min 8 characters'}
                className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm
                  focus:outline-none focus:ring-2 transition
                  ${errors.password
                    ? 'border-red-300 focus:ring-red-400 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-500'}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Active toggle (edit mode only) */}
          {isEdit && (
            <div className="flex items-center justify-between py-2 border-t">
              <div>
                <p className="text-sm font-semibold text-gray-700">Account Status</p>
                <p className="text-xs text-gray-400">
                  {form.isActive ? 'User can log in' : 'User is blocked from logging in'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200
                  ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                  shadow transition-transform duration-200
                  ${form.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5
                         rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold
                         hover:bg-blue-700 transition text-sm disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent
                                   rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <FaCheck size={12} />
                  {isEdit ? 'Save Changes' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --------------------------------------------------------------
// MAIN PAGE
// --------------------------------------------------------------
export default function AdminUsersPage() {
  const [users,       setUsers]       = useState<User[]>([]);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [showModal,   setShowModal]   = useState(false);
  const [editUser,    setEditUser]    = useState<User | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then(r => r.json())
      .then(d => {
        setUsers(d.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error('Failed');
      setUsers(prev =>
        prev.map(u => u._id === id ? { ...u, isActive: !current } : u)
      );
      toast.success(`User ${!current ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const openAdd  = () => { setEditUser(null); setShowModal(true); };
  const openEdit = (u: User) => { setEditUser(u); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditUser(null); };

  // Filter
  const filtered = users.filter(u => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Counts per role
  const counts = users.reduce((acc: Record<string, number>, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} total users · {users.filter(u => u.isActive).length} active
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5
                     rounded-xl hover:bg-blue-700 transition text-sm font-semibold
                     shadow-sm"
        >
          <FaUserPlus size={13} /> Add User
        </button>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', ...ROLES].map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition border
              ${roleFilter === role
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            <span className="capitalize">{role}</span>
            {role !== 'all' && counts[role] ? (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${roleFilter === role ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[role]}
              </span>
            ) : role === 'all' ? (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${roleFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {users.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FaSearch className="absolute left-3.5 top-3 text-gray-400" size={13} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600
                          rounded-full animate-spin mx-auto mb-3" />
          Loading users…
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Name','Email','Phone','Role','Status','Joined','Actions'].map(h => (
                  <th key={h}
                    className="text-left px-4 py-3 text-xs font-semibold
                               text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {search ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                                      justify-center text-blue-700 font-bold text-xs
                                      flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${u.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? '? Active' : '? Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg
                                   hover:bg-yellow-200 transition"
                        title="Edit user"
                      >
                        <FaEdit size={11} />
                      </button>
                      {/* Activate / Deactivate */}
                      <button
                        onClick={() => toggleActive(u._id, u.isActive)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition
                          ${u.isActive
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-400">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <UserModal
          user={editUser}
          onClose={closeModal}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
