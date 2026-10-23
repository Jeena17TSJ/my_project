'use client';
import { useEffect, useState } from 'react';
import { FaUserInjured, FaSearch, FaEye } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';

export default function DoctorPatientsPage() {
  const [patients, setPatients]   = useState<any[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');
  const [selected, setSelected]   = useState<any>(null);
  const [records,  setRecords]    = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/patients').then(r => r.json()).then(d => {
      setPatients(d.patients || []);
      setLoading(false);
    });
  }, []);

  const viewPatient = async (patient: any) => {
    setSelected(patient);
    const res = await fetch(`/api/records?patientId=${patient._id}`);
    const data = await res.json();
    setRecords(data.records || []);
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Patients</h1>

      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search patients by name or phone..."
          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-white rounded-2xl border">
              <FaUserInjured className="text-5xl mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No patients found.</p>
            </div>
          ) : filtered.map((p: any) => (
            <div key={p._id} className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  {p.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{p.gender} {p.bloodGroup ? `• ${p.bloodGroup}` : ''}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-500 mb-4">
                {p.phone && <p>📞 {p.phone}</p>}
                {p.email && <p>✉️ {p.email}</p>}
                {p.dob && <p>🎂 {new Date(p.dob).toLocaleDateString('en-IN')}</p>}
                {p.allergies?.length > 0 && (
                  <p className="text-red-500">⚠️ Allergies: {p.allergies.join(', ')}</p>
                )}
              </div>
              <button onClick={() => viewPatient(p)}
                className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 border border-blue-200 py-2 rounded-xl hover:bg-blue-50 transition">
                <FaEye size={12} /> View Details
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)}
        title="Patient Profile" size="lg">
        {selected && (
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Full Name',    value: selected.name },
                { label: 'Phone',        value: selected.phone },
                { label: 'Email',        value: selected.email },
                { label: 'Gender',       value: selected.gender },
                { label: 'Blood Group',  value: selected.bloodGroup },
                { label: 'Date of Birth', value: selected.dob ? new Date(selected.dob).toLocaleDateString('en-IN') : '—' },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">{f.value || '—'}</p>
                </div>
              ))}
            </div>

            {selected.allergies?.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-600 mb-2">⚠️ Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {selected.allergies.map((a: string) => (
                    <span key={a} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.medicalHistory && (
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-700 mb-1">Medical History</p>
                <p className="text-sm text-gray-700">{selected.medicalHistory}</p>
              </div>
            )}

            {/* Records */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Medical Records ({records.length})</h4>
              {records.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4 bg-gray-50 rounded-xl">No records yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {records.map((r: any) => (
                    <div key={r._id} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm font-medium text-gray-800">{r.diagnosis}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        {r.treatment && ` • ${r.treatment}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
