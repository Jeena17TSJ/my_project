'use client';
import { useEffect, useState } from 'react';
import {
  FaUserPlus, FaSearch, FaEdit, FaEye,
  FaTimes, FaCheck, FaExclamationTriangle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────
interface Patient {
  _id:             string;
  name:            string;
  email?:          string;
  phone?:          string;
  gender?:         string;
  dob?:            string;
  bloodGroup?:     string;
  address?:        string;
  allergies?:      string[];
  medicalHistory?: string;
  emergencyContact?: {
    name?:     string;
    phone?:    string;
    relation?: string;
  };
  userId?: {
    isActive: boolean;
  };
  createdAt: string;
}

const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

// ── Add/Edit Patient Modal ───────────────────────────────────
interface PatientModalProps {
  patient?:   Patient | null;
  onClose:    () => void;
  onSuccess:  () => void;
}

function PatientModal({ patient, onClose, onSuccess }: PatientModalProps) {
  const isEdit = !!patient;
  const [tab,  setTab]  = useState<'basic' | 'medical' | 'emergency'>('basic');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:              patient?.name              || '',
    email:             patient?.email             || '',
    phone:             patient?.phone             || '',
    gender:            patient?.gender            || '',
    dob:               patient?.dob               ? patient.dob.split('T')[0] : '',
    bloodGroup:        patient?.bloodGroup         || '',
    address:           patient?.address           || '',
    allergies:         patient?.allergies?.join(', ') || '',
    medicalHistory:    patient?.medicalHistory    || '',
    emergencyName:     patient?.emergencyContact?.name     || '',
    emergencyPhone:    patient?.emergencyContact?.phone    || '',
    emergencyRelation: patient?.emergencyContact?.relation || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email';
    if (form.phone && !/^[0-9+\s\-()]{7,15}$/.test(form.phone))
      e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { setTab('basic'); return; }
    setLoading(true);

    try {
      const payload = {
        name:          form.name.trim(),
        email:         form.email.trim(),
        phone:         form.phone.trim(),
        gender:        form.gender,
        dob:           form.dob || undefined,
        bloodGroup:    form.bloodGroup,
        address:       form.address.trim(),
        allergies:     form.allergies
          ? form.allergies.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        medicalHistory: form.medicalHistory.trim(),
        emergencyContact: {
          name:     form.emergencyName.trim(),
          phone:    form.emergencyPhone.trim(),
          relation: form.emergencyRelation.trim(),
        },
      };

      const url    = isEdit ? `/api/patients/${patient!._id}` : '/api/patients';
      const method = isEdit ? 'PUT' : 'POST';

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save patient');

      toast.success(isEdit ? 'Patient updated!' : 'Patient added successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const tabs = [
    { key: 'basic',     label: '1. Basic Info'    },
    { key: 'medical',   label: '2. Medical'       },
    { key: 'emergency', label: '3. Emergency'     },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl
                      z-10 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50
                        flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200
                       rounded-xl transition"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0 bg-gray-50">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-medium transition border-b-2
                ${tab === t.key
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">

            {/* ── Tab 1: Basic Info ───────────────────── */}
            {tab === 'basic' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="Jane Doe"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2 transition
                        ${errors.name
                          ? 'border-red-300 focus:ring-red-400 bg-red-50'
                          : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="9876543210"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2 transition
                        ${errors.phone
                          ? 'border-red-300 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      type="email"
                      placeholder="jane@example.com"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2 transition
                        ${errors.email
                          ? 'border-red-300 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={e => set('gender', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select…</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      value={form.dob}
                      onChange={e => set('dob', e.target.value)}
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={form.bloodGroup}
                      onChange={e => set('bloodGroup', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select…</option>
                      {BLOOD_GROUPS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      rows={2}
                      placeholder="123 Main Street, Bengaluru…"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                                 resize-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── Tab 2: Medical ──────────────────────── */}
            {tab === 'medical' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Allergies
                    <span className="text-gray-400 font-normal ml-1">(comma-separated)</span>
                  </label>
                  <input
                    value={form.allergies}
                    onChange={e => set('allergies', e.target.value)}
                    placeholder="e.g. Penicillin, Latex, Aspirin"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate multiple allergies with commas
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Medical History
                  </label>
                  <textarea
                    value={form.medicalHistory}
                    onChange={e => set('medicalHistory', e.target.value)}
                    rows={5}
                    placeholder="Previous dental procedures, medications, medical conditions,
previous surgeries..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                               resize-none"
                  />
                </div>

                {/* Allergy warning */}
                {form.allergies && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl
                                  p-3 flex items-start gap-2">
                    <FaExclamationTriangle
                      className="text-yellow-500 flex-shrink-0 mt-0.5" size={13} />
                    <p className="text-yellow-700 text-xs">
                      Allergies will be prominently displayed in the patient&apos;s
                      profile for all staff to see.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── Tab 3: Emergency Contact ────────────── */}
            {tab === 'emergency' && (
              <>
                <p className="text-sm text-gray-500 bg-blue-50 rounded-xl p-3">
                  Emergency contact is notified if the patient cannot be reached.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    value={form.emergencyName}
                    onChange={e => set('emergencyName', e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    value={form.emergencyPhone}
                    onChange={e => set('emergencyPhone', e.target.value)}
                    placeholder="9876543210"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Relationship to Patient
                  </label>
                  <select
                    value={form.emergencyRelation}
                    onChange={e => set('emergencyRelation', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select…</option>
                    {['Spouse','Parent','Child','Sibling','Friend',
                      'Guardian','Other'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
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
                  {isEdit ? 'Update Patient' : 'Add Patient'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── View Patient Detail Modal ────────────────────────────────
function PatientViewModal({ patient, onClose, onEdit }: {
  patient:  Patient;
  onClose:  () => void;
  onEdit:   () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10
                      overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50
                        flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Patient Profile</h2>
          <button onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200
                       rounded-xl transition">
            <FaTimes size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center
                            justify-center text-white text-xl font-bold flex-shrink-0">
              {patient.name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{patient.name}</h3>
              <p className="text-gray-500 text-sm capitalize">
                {patient.gender || 'Unknown gender'}
                {patient.bloodGroup ? ` · ${patient.bloodGroup}` : ''}
              </p>
            </div>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold
              ${patient.userId?.isActive !== false
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'}`}>
              {patient.userId?.isActive !== false ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Basic details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Phone',       value: patient.phone      || '—' },
              { label: 'Email',       value: patient.email      || '—' },
              { label: 'Date of Birth', value: patient.dob ? new Date(patient.dob).toLocaleDateString('en-IN') : '—' },
              { label: 'Address',     value: patient.address    || '—' },
              { label: 'Registered',  value: new Date(patient.createdAt).toLocaleDateString('en-IN') },
            ].map(row => (
              <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                <p className="text-sm font-semibold text-gray-800 break-words">
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          {/* Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                <FaExclamationTriangle size={11} /> ALLERGIES
              </p>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a, i) => (
                  <span key={i}
                    className="bg-red-100 text-red-700 text-xs px-2.5 py-1
                               rounded-full font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medical history */}
          {patient.medicalHistory && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">Medical History</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {patient.medicalHistory}
              </p>
            </div>
          )}

          {/* Emergency contact */}
          {patient.emergencyContact?.name && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-700 mb-2">Emergency Contact</p>
              <p className="text-sm font-bold text-gray-800">
                {patient.emergencyContact.name}
              </p>
              <p className="text-sm text-gray-600">
                {patient.emergencyContact.phone}
                {patient.emergencyContact.relation
                  ? ` · ${patient.emergencyContact.relation}`
                  : ''}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3 flex-shrink-0">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600
                       text-white py-2.5 rounded-xl font-bold hover:bg-blue-700
                       transition text-sm"
          >
            <FaEdit size={12} /> Edit Patient
          </button>
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl
                       font-semibold hover:bg-gray-50 transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function AdminPatientsPage() {
  const [patients,    setPatients]    = useState<Patient[]>([]);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);

  const fetchPatients = () => {
    setLoading(true);
    fetch('/api/patients')
      .then(r => r.json())
      .then(d => {
        setPatients(d.patients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.bloodGroup?.includes(q.toUpperCase())
    );
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {patients.length} registered patient{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5
                     rounded-xl hover:bg-blue-700 transition text-sm font-semibold
                     shadow-sm"
        >
          <FaUserPlus size={13} /> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FaSearch className="absolute left-3.5 top-3 text-gray-400" size={13} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, email or blood group…"
          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600
                          rounded-full animate-spin mx-auto mb-3" />
          Loading patients…
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Patient','Contact','Gender','Blood','Allergies','Status','Actions'].map(h => (
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
                    {search ? 'No patients match your search.' : 'No patients found.'}
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                                      justify-center text-blue-700 font-bold text-xs
                                      flex-shrink-0">
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        {p.dob && (
                          <p className="text-xs text-gray-400">
                            DOB: {new Date(p.dob).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-700">{p.phone || '—'}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[140px]">
                      {p.email || '—'}
                    </p>
                  </td>
                  {/* Gender */}
                  <td className="px-4 py-3 text-gray-600 capitalize text-xs">
                    {p.gender || '—'}
                  </td>
                  {/* Blood group */}
                  <td className="px-4 py-3">
                    {p.bloodGroup ? (
                      <span className="bg-red-100 text-red-700 text-xs font-bold
                                       px-2 py-0.5 rounded">
                        {p.bloodGroup}
                      </span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  {/* Allergies */}
                  <td className="px-4 py-3">
                    {p.allergies && p.allergies.length > 0 ? (
                      <span className="bg-yellow-100 text-yellow-700 text-xs
                                       font-medium px-2 py-0.5 rounded">
                        ⚠️ {p.allergies.length} allerg{p.allergies.length > 1 ? 'ies' : 'y'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${p.userId?.isActive !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'}`}>
                      {p.userId?.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewPatient(p)}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg
                                   hover:bg-blue-200 transition"
                        title="View"
                      >
                        <FaEye size={11} />
                      </button>
                      <button
                        onClick={() => setEditPatient(p)}
                        className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg
                                   hover:bg-yellow-200 transition"
                        title="Edit"
                      >
                        <FaEdit size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-400">
            Showing {filtered.length} of {patients.length} patient{patients.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <PatientModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchPatients}
        />
      )}

      {/* Edit Modal */}
      {editPatient && (
        <PatientModal
          patient={editPatient}
          onClose={() => setEditPatient(null)}
          onSuccess={fetchPatients}
        />
      )}

      {/* View Modal */}
      {viewPatient && (
        <PatientViewModal
          patient={viewPatient}
          onClose={() => setViewPatient(null)}
          onEdit={() => {
            setEditPatient(viewPatient);
            setViewPatient(null);
          }}
        />
      )}
    </div>
  );
}
