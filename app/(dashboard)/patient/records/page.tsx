'use client';
import { useEffect, useState } from 'react';
import {
  FaFileMedical, FaEye, FaPills, FaStethoscope,
  FaCalendarAlt, FaUserMd, FaChevronDown,
  FaChevronUp, FaExclamationTriangle, FaPrint,
  FaSearch, FaClock,
} from 'react-icons/fa';
import { PageLoader } from '@/components/ui/Spinner';

interface Prescription {
  medicine: string;
  dosage:   string;
  duration: string;
}

interface Record {
  _id:         string;
  diagnosis:   string;
  treatment?:  string;
  prescription: Prescription[];
  notes?:      string;
  nextVisit?:  string;
  createdAt:   string;
  doctorId?: {
    name:           string;
    specialization: string;
    qualification?: string;
  };
  patientId?: {
    name:        string;
    email:       string;
    phone:       string;
    dob?:        string;
    gender?:     string;
    bloodGroup?: string;
    allergies?:  string[];
  };
}

// -- Single Record Card (expandable) -------------------------
function RecordCard({ record }: { record: Record }) {
  const [expanded, setExpanded] = useState(false);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Record - ${record.diagnosis}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111; max-width: 700px; margin: 0 auto; }
          h1   { color: #1d4ed8; font-size: 22px; margin-bottom: 4px; }
          h2   { font-size: 15px; color: #374151; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
          .label { color: #6b7280; }
          .val   { font-weight: 600; }
          table  { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th     { background: #eff6ff; color: #1e40af; padding: 8px 12px; text-align: left; font-size: 13px; }
          td     { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>DentalCare Dental Clinic</h1>
        <p style="color:#6b7280;font-size:13px;">Medical Record - ${new Date(record.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</p>

        <h2>Doctor</h2>
        <div class="row"><span class="label">Name</span><span class="val">${record.doctorId?.name || '-'}</span></div>
        <div class="row"><span class="label">Specialization</span><span class="val">${record.doctorId?.specialization || '-'}</span></div>

        <h2>Diagnosis &amp; Treatment</h2>
        <div class="row"><span class="label">Diagnosis</span><span class="val">${record.diagnosis}</span></div>
        <div class="row"><span class="label">Treatment</span><span class="val">${record.treatment || '-'}</span></div>
        ${record.nextVisit ? `<div class="row"><span class="label">Next Visit</span><span class="val">${new Date(record.nextVisit).toLocaleDateString('en-IN')}</span></div>` : ''}

        ${record.prescription?.length > 0 ? `
        <h2>Prescription</h2>
        <table>
          <tr><th>Medicine</th><th>Dosage</th><th>Duration</th></tr>
          ${record.prescription.map(p => `<tr><td>${p.medicine}</td><td>${p.dosage}</td><td>${p.duration}</td></tr>`).join('')}
        </table>` : ''}

        ${record.notes ? `<h2>Doctor's Notes</h2><p style="font-size:14px;color:#374151;">${record.notes}</p>` : ''}

        <div class="footer">
          DentalCare Dental Clinic · 123 Health Street, Koramangala, Bengaluru 560034<br/>
          +91-80-1234-5678 · info@dentalcare.in
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                     transition-all duration-200
                     ${expanded ? 'border-blue-200 shadow-md' : 'border-gray-100'}`}>

      {/* Card header - always visible */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer
                   hover:bg-gray-50 transition"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                           flex-shrink-0 transition
                           ${expanded ? 'bg-blue-600' : 'bg-blue-100'}`}>
            <FaFileMedical
              className={expanded ? 'text-white' : 'text-blue-600'}
              size={16}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 text-base truncate">
              {record.diagnosis}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <FaUserMd size={9} className="text-blue-400" />
                {record.doctorId?.name || 'Unknown doctor'}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <FaCalendarAlt size={9} className="text-blue-400" />
                {new Date(record.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
              {record.prescription?.length > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2
                                 py-0.5 rounded-full font-medium">
                  {record.prescription.length} medicine
                  {record.prescription.length > 1 ? 's' : ''}
                </span>
              )}
              {record.nextVisit && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2
                                 py-0.5 rounded-full font-medium">
                  Follow-up scheduled
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); handlePrint(); }}
            title="Print record"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50
                       rounded-lg transition"
          >
            <FaPrint size={13} />
          </button>
          {expanded
            ? <FaChevronUp  className="text-blue-500" size={13} />
            : <FaChevronDown className="text-gray-400" size={13} />
          }
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50">

          {/* Diagnosis + Treatment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
                <FaStethoscope size={10} /> DIAGNOSIS
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {record.diagnosis}
              </p>
            </div>
            {record.treatment && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 mb-1">
                  TREATMENT
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {record.treatment}
                </p>
              </div>
            )}
          </div>

          {/* Doctor info */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center
                            justify-center text-white font-bold text-sm flex-shrink-0">
              {record.doctorId?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {record.doctorId?.name || '-'}
              </p>
              <p className="text-xs text-gray-500">
                {record.doctorId?.specialization}
                {record.doctorId?.qualification
                  ? ` - ${record.doctorId.qualification}`
                  : ''}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">Consultation Date</p>
              <p className="text-xs font-semibold text-gray-700">
                {new Date(record.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'short', day: '2-digit',
                  month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Prescription - most important section */}
          {record.prescription?.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold
                             text-gray-700 mb-3">
                <FaPills className="text-green-500" size={14} />
                Prescription
                <span className="ml-auto text-xs bg-green-100 text-green-700
                                 px-2 py-0.5 rounded-full font-medium">
                  {record.prescription.length} medication
                  {record.prescription.length > 1 ? 's' : ''}
                </span>
              </h4>
              <div className="border border-green-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 bg-green-50 px-4 py-2.5 border-b
                                border-green-200">
                  {['Medicine', 'Dosage', 'Duration'].map(h => (
                    <span key={h}
                      className="text-xs font-bold text-green-700 uppercase tracking-wide">
                      {h}
                    </span>
                  ))}
                </div>
                {record.prescription.map((p, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-3 px-4 py-3 text-sm
                      ${i < record.prescription.length - 1
                        ? 'border-b border-gray-100' : ''}`}
                  >
                    <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full
                                       flex items-center justify-center text-xs font-bold
                                       flex-shrink-0">
                        {i + 1}
                      </span>
                      {p.medicine}
                    </span>
                    <span className="text-gray-600">{p.dosage || '-'}</span>
                    <span className="text-gray-600">{p.duration || '-'}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <FaExclamationTriangle size={10} className="text-yellow-500" />
                Follow prescription as directed. Contact clinic for any side effects.
              </p>
            </div>
          )}

          {/* Doctor's notes */}
          {record.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs font-bold text-yellow-700 mb-2">
                Doctor&apos;s Notes
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {record.notes}
              </p>
            </div>
          )}

          {/* Next visit */}
          {record.nextVisit && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4
                            flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center
                              justify-center flex-shrink-0">
                <FaClock className="text-orange-600" size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-700">Next Visit Scheduled</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {new Date(record.nextVisit).toLocaleDateString('en-IN', {
                    weekday: 'long', day: '2-digit',
                    month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <a
                href="/appointment"
                className="ml-auto text-xs bg-orange-500 text-white px-3 py-1.5
                           rounded-lg font-semibold hover:bg-orange-600 transition
                           whitespace-nowrap"
              >
                Book Now
              </a>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------
// MAIN PAGE
// --------------------------------------------------------------
export default function PatientRecordsPage() {
  const [records,  setRecords]  = useState<Record[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    fetch('/api/records')
      .then(r => r.json())
      .then(d => setRecords(d.records || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.diagnosis?.toLowerCase().includes(q) ||
      r.treatment?.toLowerCase().includes(q) ||
      r.doctorId?.name?.toLowerCase().includes(q) ||
      r.prescription?.some(p => p.medicine?.toLowerCase().includes(q))
    );
  });

  const totalMedicines = records.reduce(
    (sum, r) => sum + (r.prescription?.length || 0), 0
  );

  const upcomingVisit = records
    .filter(r => r.nextVisit && new Date(r.nextVisit) > new Date())
    .sort((a, b) => new Date(a.nextVisit!).getTime() - new Date(b.nextVisit!).getTime())[0];

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Medical Records</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your complete dental treatment history
          </p>
        </div>
        {records.length > 0 && (
          <button
            onClick={() => setExpandAll(e => !e)}
            className="text-sm text-blue-600 border border-blue-200 px-4 py-2
                       rounded-xl hover:bg-blue-50 transition font-medium"
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        )}
      </div>

      {/* Summary cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-2xl font-extrabold text-blue-700">{records.length}</p>
            <p className="text-blue-600 text-sm">Total Records</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-2xl font-extrabold text-green-700">{totalMedicines}</p>
            <p className="text-green-600 text-sm">Medicines Prescribed</p>
          </div>
          <div className={`rounded-2xl p-4 ${upcomingVisit ? 'bg-orange-50' : 'bg-gray-50'}`}>
            {upcomingVisit ? (
              <>
                <p className="text-sm font-bold text-orange-700">Next Visit</p>
                <p className="text-orange-600 text-sm font-semibold mt-0.5">
                  {new Date(upcomingVisit.nextVisit!).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold text-gray-400">-</p>
                <p className="text-gray-400 text-sm">No upcoming visit</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      {records.length > 0 && (
        <div className="relative mb-5">
          <FaSearch className="absolute left-3.5 top-3 text-gray-400" size={13} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by diagnosis, treatment, doctor or medicine-"
            className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Records list */}
      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <FaFileMedical className="text-5xl mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 font-semibold">
            {search ? 'No records match your search.' : 'No medical records yet.'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {!search &&
              'Records will appear here after your appointments are completed.'}
          </p>
          {!search && (
            <a
              href="/appointment"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2.5
                         rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
            >
              Book an Appointment
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(record => (
            <RecordCard key={record._id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
