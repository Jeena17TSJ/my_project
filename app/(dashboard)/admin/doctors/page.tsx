// dental-clinic\app\(dashboard)\admin\doctors\page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  FaUserMd, FaEdit, FaTrash, FaStar, FaPlus,
  FaSearch, FaEye, FaToggleOn, FaToggleOff,
  FaCalendarCheck, FaPhone, FaEnvelope,
  FaGraduationCap, FaClock,
} from 'react-icons/fa';
import Modal          from '@/components/ui/Modal';
import ConfirmDialog  from '@/components/ui/ConfirmDialog';
import DoctorForm     from '@/components/forms/DoctorForm';
import { PageLoader } from '@/components/ui/Spinner';
import toast          from 'react-hot-toast';

const DAYS_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

const SPECIALIZATION_COLORS: Record<string, string> = {
  'General & Cosmetic Dentistry': 'bg-blue-100   text-blue-700',
  'Orthodontics':                 'bg-purple-100 text-purple-700',
  'Oral Surgery & Implants':      'bg-red-100    text-red-700',
  'Pediatric Dentistry':          'bg-green-100  text-green-700',
  'Periodontics':                 'bg-yellow-100 text-yellow-700',
  'Endodontics':                  'bg-orange-100 text-orange-700',
  'Prosthodontics':               'bg-teal-100   text-teal-700',
};

export default function AdminDoctorsPage() {
  const [doctors,      setDoctors]      = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [view,         setView]         = useState<'grid' | 'table'>('grid');
  const [showModal,    setShowModal]    = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [selected,     setSelected]     = useState<any>(null);
  const [profileData,  setProfileData]  = useState<any>(null);
  const [profileStats, setProfileStats] = useState<any>(null);
  const [profileAppts, setProfileAppts] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  /* ── fetch ────────────────────────────────────────────── */
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/doctors');
      const data = await res.json();
      setDoctors(data.doctors || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  /* ── view doctor profile ──────────────────────────────── */
  const openProfile = async (doctor: any) => {
    setProfileData(doctor);
    setShowProfile(true);
    setProfileLoading(true);
    try {
      const [statsRes, apptRes] = await Promise.all([
        fetch(`/api/doctors/${doctor._id}/stats`),
        fetch(`/api/doctors/${doctor._id}/appointments`),
      ]);
      const [statsData, apptData] = await Promise.all([
        statsRes.json(), apptRes.json(),
      ]);
      setProfileStats(statsData);
      setProfileAppts(apptData.appointments || []);
    } catch {
      toast.error('Failed to load doctor details');
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── toggle active ────────────────────────────────────── */
  const toggleActive = async (doctor: any) => {
    try {
      const res = await fetch(`/api/doctors/${doctor._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isActive: !doctor.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(
        doctor.isActive ? 'Doctor deactivated' : 'Doctor activated'
      );
      fetchDoctors();
    } catch {
      toast.error('Failed to update status');
    }
  };

  /* ── delete ───────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res  = await fetch(`/api/doctors/${deleteTarget}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Doctor removed');
      fetchDoctors();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };

  /* ── filtered list ────────────────────────────────────── */
  const filtered = doctors.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q)
    );
  });

  const activeCount   = doctors.filter(d => d.isActive !== false).length;
  const inactiveCount = doctors.filter(d => d.isActive === false).length;

  /* ────────────────────────────────────────────────────── */
  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doctor Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} active · {inactiveCount} inactive
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white
                     px-5 py-2.5 rounded-xl hover:bg-blue-700 transition
                     text-sm font-semibold shadow-sm"
        >
          <FaPlus size={12} /> Add Doctor
        </button>
      </div>

      {/* Search + view toggle */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3 text-gray-400" size={13} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, specialization or email…"
            className="w-full border border-gray-300 rounded-xl pl-9 pr-4
                       py-2.5 text-sm focus:outline-none focus:ring-2
                       focus:ring-blue-500"
          />
        </div>
        <div className="flex border border-gray-300 rounded-xl overflow-hidden">
          {(['grid','table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-2 text-sm transition ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {v === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <FaUserMd className="text-6xl mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">
            {search ? 'No doctors match your search.' : 'No doctors added yet.'}
          </p>
          {!search && (
            <button
              onClick={() => { setSelected(null); setShowModal(true); }}
              className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl
                         text-sm font-semibold hover:bg-blue-700 transition"
            >
              Add First Doctor
            </button>
          )}
        </div>

      ) : view === 'grid' ? (
        /* ── GRID VIEW ──────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((d: any) => (
            <div key={d._id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                          hover:shadow-md transition-all duration-200
                          ${d.isActive === false ? 'opacity-60' : ''}`}>

              {/* Card top */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-5 pt-5 pb-8">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center
                                  justify-center text-white text-2xl font-bold
                                  border-2 border-white/30 overflow-hidden">
                    {d.image ? (
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      d.name?.charAt(0)
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => toggleActive(d)}
                      title={d.isActive !== false ? 'Deactivate' : 'Activate'}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg
                                 text-white transition"
                    >
                      {d.isActive !== false
                        ? <FaToggleOn  size={16} className="text-green-300" />
                        : <FaToggleOff size={16} className="text-red-300" />
                      }
                    </button>
                    <button
                      onClick={() => openProfile(d)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg
                                 text-white transition"
                      title="View profile"
                    >
                      <FaEye size={13} />
                    </button>
                    <button
                      onClick={() => { setSelected(d); setShowModal(true); }}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg
                                 text-white transition"
                      title="Edit"
                    >
                      <FaEdit size={13} />
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(d._id); setShowConfirm(true); }}
                      className="p-1.5 bg-white/10 hover:bg-red-500/40 rounded-lg
                                 text-white transition"
                      title="Delete"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="-mt-5 mx-5 bg-white rounded-xl shadow-sm border px-4 py-3 mb-4">
                <h3 className="font-bold text-gray-800 text-base">{d.name}</h3>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full
                                  font-medium mt-1
                  ${SPECIALIZATION_COLORS[d.specialization] || 'bg-gray-100 text-gray-700'}`}>
                  {d.specialization}
                </span>
              </div>

              <div className="px-5 pb-5 space-y-2.5">
                {/* Qualification + Experience */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaGraduationCap className="text-blue-400 flex-shrink-0" />
                  <span className="truncate">{d.qualification || '—'}</span>
                  <span className="ml-auto flex-shrink-0 font-medium text-gray-700">
                    {d.experience} yrs
                  </span>
                </div>

                {/* Rating + Fee */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i}
                        size={11}
                        className={i < Math.round(d.rating || 0)
                          ? 'text-yellow-400' : 'text-gray-200'} />
                    ))}
                    <span className="text-xs text-gray-600 ml-1 font-medium">
                      {d.rating}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    ₹{d.consultationFee?.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-gray-400">/visit</span>
                  </span>
                </div>

                {/* Contact */}
                {(d.email || d.phone) && (
                  <div className="space-y-1 pt-1 border-t border-gray-50">
                    {d.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FaPhone size={9} className="text-blue-400" /> {d.phone}
                      </div>
                    )}
                    {d.email && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FaEnvelope size={9} className="text-blue-400" />
                        <span className="truncate">{d.email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Available days */}
                <div className="pt-1 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-1.5">Available Days</p>
                  <div className="flex flex-wrap gap-1">
                    {d.availableDays?.length > 0 ? (
                      d.availableDays.map((day: string) => (
                        <span key={day}
                          className="bg-blue-50 text-blue-600 text-xs px-2
                                     py-0.5 rounded-lg font-medium">
                          {DAYS_SHORT[day] || day}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Not set</span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                    ${d.isActive !== false
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'}`}>
                    {d.isActive !== false ? '● Active' : '● Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      ) : (
        /* ── TABLE VIEW ─────────────────────────────────── */
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    'Doctor','Specialization','Qualification',
                    'Experience','Fee','Rating',
                    'Available Days','Status','Actions',
                  ].map(h => (
                    <th key={h}
                      className="text-left px-4 py-3 text-xs font-semibold
                                 text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((d: any) => (
                  <tr key={d._id}
                    className={`hover:bg-gray-50 transition
                      ${d.isActive === false ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                                        justify-center text-blue-700 font-bold text-sm
                                        flex-shrink-0 overflow-hidden">
                          {d.image ? (
                            <img
                              src={d.image}
                              alt={d.name}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            d.name?.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{d.name}</p>
                          {d.email && (
                            <p className="text-xs text-gray-400">{d.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${SPECIALIZATION_COLORS[d.specialization] || 'bg-gray-100 text-gray-700'}`}>
                        {d.specialization}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {d.qualification || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {d.experience} yrs
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-700">
                      ₹{d.consultationFee?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" size={11} />
                        <span className="text-sm font-medium text-gray-700">
                          {d.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {d.availableDays?.slice(0, 4).map((day: string) => (
                          <span key={day}
                            className="bg-blue-50 text-blue-600 text-xs
                                       px-1.5 py-0.5 rounded font-medium">
                            {DAYS_SHORT[day] || day}
                          </span>
                        ))}
                        {d.availableDays?.length > 4 && (
                          <span className="text-gray-400 text-xs">
                            +{d.availableDays.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold
                        ${d.isActive !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'}`}>
                        {d.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openProfile(d)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg
                                     hover:bg-blue-200 transition" title="Profile">
                          <FaEye size={11} />
                        </button>
                        <button
                          onClick={() => { setSelected(d); setShowModal(true); }}
                          className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg
                                     hover:bg-yellow-200 transition" title="Edit">
                          <FaEdit size={11} />
                        </button>
                        <button
                          onClick={() => toggleActive(d)}
                          className={`p-1.5 rounded-lg transition
                            ${d.isActive !== false
                              ? 'bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          title={d.isActive !== false ? 'Deactivate' : 'Activate'}>
                          {d.isActive !== false
                            ? <FaToggleOff size={13} />
                            : <FaToggleOn  size={13} />
                          }
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(d._id); setShowConfirm(true); }}
                          className="p-1.5 bg-red-100 text-red-500 rounded-lg
                                     hover:bg-red-200 transition" title="Delete">
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-400">
            {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} shown
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ──────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selected ? 'Edit Doctor' : 'Add New Doctor'}
        size="lg"
      >
        <DoctorForm
          initial={selected}
          onSuccess={() => { setShowModal(false); fetchDoctors(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* ── Doctor Profile Modal ─────────────────────────── */}
      <Modal
        isOpen={showProfile}
        onClose={() => { setShowProfile(false); setProfileData(null); }}
        title="Doctor Profile"
        size="xl"
      >
        {profileData && (
          <div className="space-y-5">
            {/* Profile header */}
            <div className="flex items-start gap-5 pb-5 border-b">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700
                              rounded-2xl flex items-center justify-center
                              text-white text-2xl font-extrabold flex-shrink-0 overflow-hidden">
                {profileData.image ? (
                  <img
                    src={profileData.image}
                    alt={profileData.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  profileData.name?.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{profileData.name}</h2>
                <p className="text-blue-600 font-medium">{profileData.specialization}</p>
                <p className="text-gray-500 text-sm">{profileData.qualification}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} size={12}
                        className={i < Math.round(profileData.rating)
                          ? 'text-yellow-400' : 'text-gray-200'} />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">{profileData.rating}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-600">
                    {profileData.experience} years experience
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm font-bold text-green-700">
                    ₹{profileData.consultationFee?.toLocaleString('en-IN')}/visit
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold
                ${profileData.isActive !== false
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'}`}>
                {profileData.isActive !== false ? '● Active' : '● Inactive'}
              </span>
            </div>

            {/* Stats */}
            {profileLoading ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                Loading stats…
              </div>
            ) : profileStats && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'Total',     value: profileStats.totalAppointments,     color: 'blue'   },
                  { label: 'Today',     value: profileStats.todayAppointments,     color: 'purple' },
                  { label: 'Pending',   value: profileStats.pendingAppointments,   color: 'yellow' },
                  { label: 'Confirmed', value: profileStats.confirmedAppointments, color: 'blue'   },
                  { label: 'Completed', value: profileStats.completedAppointments, color: 'green'  },
                  { label: 'Cancelled', value: profileStats.cancelledAppointments, color: 'red'    },
                ].map(s => {
                  const colorMap: Record<string, string> = {
                    blue:   'bg-blue-50   text-blue-700',
                    purple: 'bg-purple-50 text-purple-700',
                    yellow: 'bg-yellow-50 text-yellow-700',
                    green:  'bg-green-50  text-green-700',
                    red:    'bg-red-50    text-red-700',
                  };
                  return (
                    <div key={s.label}
                      className={`${colorMap[s.color]} rounded-xl p-3 text-center`}>
                      <p className="text-xl font-extrabold">{s.value}</p>
                      <p className="text-xs mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Phone',  value: profileData.phone || '—', icon: <FaPhone className="text-blue-400" size={11} /> },
                { label: 'Email',  value: profileData.email || '—', icon: <FaEnvelope className="text-blue-400" size={11} /> },
              ].map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                  {row.icon}
                  <div>
                    <p className="text-xs text-gray-400">{row.label}</p>
                    <p className="text-sm font-medium text-gray-800">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Available days */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarCheck className="text-blue-500" /> Available Days
              </p>
              <div className="flex flex-wrap gap-2">
                {profileData.availableDays?.map((day: string) => (
                  <span key={day}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg
                               text-sm font-medium">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Available slots */}
            {profileData.availableSlots?.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaClock className="text-blue-500" /> Available Time Slots
                </p>
                <div className="space-y-2">
                  {profileData.availableSlots.map((s: any) => (
                    <div key={s.day} className="flex items-start gap-3">
                      <span className="text-xs font-semibold text-gray-600 w-24 flex-shrink-0 pt-1">
                        {s.day}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {s.slots?.map((slot: string) => (
                          <span key={slot}
                            className="bg-white border border-blue-200 text-blue-600
                                       text-xs px-2 py-0.5 rounded-lg font-medium">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {profileData.bio && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">About</p>
                <p className="text-sm text-gray-700 leading-relaxed">{profileData.bio}</p>
              </div>
            )}

            {/* Recent appointments */}
            {!profileLoading && profileAppts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Recent Appointments ({profileAppts.length} total)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {profileAppts.slice(0, 5).map((a: any) => (
                    <div key={a._id}
                      className="flex items-center justify-between bg-gray-50
                                 rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {a.patientName}
                        </p>
                        <p className="text-xs text-gray-500">{a.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          {new Date(a.date).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                          ${a.status === 'completed'  ? 'bg-green-100  text-green-700'  :
                            a.status === 'confirmed'  ? 'bg-blue-100   text-blue-700'   :
                            a.status === 'cancelled'  ? 'bg-red-100    text-red-700'    :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  setShowProfile(false);
                  setSelected(profileData);
                  setShowModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2
                           border border-blue-600 text-blue-600 py-2.5
                           rounded-xl font-semibold hover:bg-blue-50
                           transition text-sm"
              >
                <FaEdit size={12} /> Edit Profile
              </button>
              <button
                onClick={() => toggleActive(profileData)}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition text-sm
                  ${profileData.isActive !== false
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {profileData.isActive !== false ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm ────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Remove Doctor"
        message="Are you sure? If this doctor has upcoming appointments, deletion will be blocked. You can deactivate instead."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setShowConfirm(false); setDeleteTarget(null); }}
      />
    </div>
  );
}
