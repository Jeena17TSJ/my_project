'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  FaCheck, FaTimes, FaEye, FaSearch,
  FaFilter, FaCalendarCheck, FaClock,
} from 'react-icons/fa';
import Modal         from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import toast          from 'react-hot-toast';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700 border border-yellow-300',
  confirmed: 'bg-blue-100   text-blue-700   border border-blue-300',
  completed: 'bg-green-100  text-green-700  border border-green-300',
  cancelled: 'bg-red-100    text-red-700    border border-red-300',
};

const VIA_STYLES: Record<string, string> = {
  chatbot:  'bg-purple-100 text-purple-700',
  website:  'bg-blue-100   text-blue-700',
  patient:  'bg-green-100  text-green-700',
  admin:    'bg-gray-100   text-gray-700',
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');
  const [viewAppt,     setViewAppt]     = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open:    boolean;
    id:      string;
    action:  'confirm' | 'cancel' | 'complete';
    name:    string;
  }>({ open: false, id: '', action: 'confirm', name: '' });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter !== 'all'
        ? `/api/appointments?status=${filter}`
        : '/api/appointments';
      const res  = await fetch(url);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(
        status === 'confirmed'  ? 'Appointment confirmed - patient notified!' :
        status === 'cancelled'  ? 'Appointment cancelled - patient notified!'  :
        status === 'completed'  ? 'Appointment marked complete!'              :
        'Status updated'
      );
      fetchAppointments();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setConfirmDialog(d => ({ ...d, open: false }));
    }
  };

  const openConfirm = (id: string, action: 'confirm' | 'cancel' | 'complete', name: string) => {
    setConfirmDialog({ open: true, id, action, name });
  };

  // Filter + search
  const displayed = appointments.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.patientName?.toLowerCase().includes(q) ||
      a.doctorName?.toLowerCase().includes(q)  ||
      a.service?.toLowerCase().includes(q)     ||
      a.phone?.includes(q)                     ||
      a.email?.toLowerCase().includes(q)
    );
  });

  // Counts for tab badges
  const counts = appointments.reduce((acc: any, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const tabs = [
    { key: 'all',       label: 'All',       count: appointments.length },
    { key: 'pending',   label: 'Pending',   count: counts.pending   || 0 },
    { key: 'confirmed', label: 'Confirmed', count: counts.confirmed || 0 },
    { key: 'completed', label: 'Completed', count: counts.completed || 0 },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled || 0 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointment Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage and confirm all patient appointments
          </p>
        </div>
        {counts.pending > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200
                          text-yellow-700 px-4 py-2 rounded-xl text-sm font-medium">
            <FaClock size={13} />
            {counts.pending} appointment{counts.pending > 1 ? 's' : ''} awaiting confirmation
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        whitespace-nowrap transition border
              ${filter === tab.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                ${filter === tab.key
                  ? 'bg-white/20 text-white'
                  : tab.key === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <FaSearch className="absolute left-3.5 top-3 text-gray-400" size={13} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name, doctor, service, phone or email…"
          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    'Patient', 'Contact', 'Doctor', 'Service',
                    'Date & Time', 'Status', 'Via', 'Actions',
                  ].map(h => (
                    <th key={h}
                      className="text-left px-4 py-3 text-xs font-semibold
                                 text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={8}
                      className="text-center py-16 text-gray-400">
                      <FaCalendarCheck className="text-5xl mx-auto mb-3 opacity-20" />
                      <p>No appointments found.</p>
                    </td>
                  </tr>
                ) : displayed.map((a: any) => (
                  <tr key={a._id}
                    className={`hover:bg-gray-50 transition
                      ${a.status === 'pending' ? 'bg-yellow-50/30' : ''}`}>

                    {/* Patient */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                                        justify-center text-blue-600 font-bold text-sm
                                        flex-shrink-0">
                          {a.patientName?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800 whitespace-nowrap">
                          {a.patientName}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <p className="text-gray-600 text-xs">{a.phone || '—'}</p>
                      <p className="text-gray-400 text-xs truncate max-w-[140px]">
                        {a.email || '—'}
                      </p>
                    </td>

                    {/* Doctor */}
                    <td className="px-4 py-3 text-gray-700 text-xs whitespace-nowrap">
                      {a.doctorName || '—'}
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3 text-gray-700 text-xs whitespace-nowrap">
                      {a.service}
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-gray-800 text-xs font-medium">
                        {new Date(a.date).toLocaleDateString('en-IN', {
                          weekday: 'short', day: '2-digit',
                          month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-gray-500 text-xs">{a.timeSlot}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                       ${STATUS_STYLES[a.status]}`}>
                        {a.status === 'pending' && '⏳ '}
                        {a.status === 'confirmed' && '✅ '}
                        {a.status === 'completed' && '🎉 '}
                        {a.status === 'cancelled' && '❌ '}
                        {a.status}
                      </span>
                    </td>

                    {/* Booked via */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize
                                       ${VIA_STYLES[a.bookedVia] || VIA_STYLES.website}`}>
                        {a.bookedVia === 'chatbot' ? '🤖 ' : a.bookedVia === 'patient' ? '👤 ' : '🌐 '}
                        {a.bookedVia}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => setViewAppt(a)}
                          className="p-1.5 bg-gray-100 text-gray-500 rounded-lg
                                     hover:bg-blue-100 hover:text-blue-600 transition"
                          title="View details"
                        >
                          <FaEye size={11} />
                        </button>

                        {/* Confirm (pending only) */}
                        {a.status === 'pending' && (
                          <button
                            onClick={() => openConfirm(a._id, 'confirm', a.patientName)}
                            className="flex items-center gap-1 px-2 py-1.5 bg-green-100
                                       text-green-700 rounded-lg hover:bg-green-200
                                       transition text-xs font-semibold"
                            title="Confirm appointment"
                          >
                            <FaCheck size={10} /> Confirm
                          </button>
                        )}

                        {/* Complete (confirmed only) */}
                        {a.status === 'confirmed' && (
                          <button
                            onClick={() => openConfirm(a._id, 'complete', a.patientName)}
                            className="flex items-center gap-1 px-2 py-1.5 bg-blue-100
                                       text-blue-700 rounded-lg hover:bg-blue-200
                                       transition text-xs font-semibold"
                            title="Mark complete"
                          >
                            🎉 Done
                          </button>
                        )}

                        {/* Cancel (pending or confirmed) */}
                        {['pending', 'confirmed'].includes(a.status) && (
                          <button
                            onClick={() => openConfirm(a._id, 'cancel', a.patientName)}
                            className="p-1.5 bg-red-100 text-red-500 rounded-lg
                                       hover:bg-red-200 transition"
                            title="Cancel appointment"
                          >
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

          {/* Footer count */}
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-400">
            Showing {displayed.length} of {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      <Modal
        isOpen={!!viewAppt}
        onClose={() => setViewAppt(null)}
        title="Appointment Details"
        size="md"
      >
        {viewAppt && (
          <div className="space-y-4">
            {/* Status badge */}
            <div className="flex justify-center">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold
                               ${STATUS_STYLES[viewAppt.status]}`}>
                {viewAppt.status.toUpperCase()}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Patient Name', value: viewAppt.patientName       },
                { label: 'Phone',        value: viewAppt.phone || '—'      },
                { label: 'Email',        value: viewAppt.email || '—'      },
                { label: 'Doctor',       value: viewAppt.doctorName || '—' },
                { label: 'Service',      value: viewAppt.service           },
                { label: 'Fee',          value: viewAppt.fee ? `₹${viewAppt.fee.toLocaleString('en-IN')}` : '—' },
                { label: 'Date',         value: new Date(viewAppt.date).toLocaleDateString('en-IN', {
                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                  })
                },
                { label: 'Time',         value: viewAppt.timeSlot          },
                { label: 'Booked Via',   value: viewAppt.bookedVia         },
                { label: 'Booked On',    value: new Date(viewAppt.createdAt).toLocaleString('en-IN') },
              ].map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize break-words">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Notes */}
            {viewAppt.notes && (
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-xs text-yellow-600 font-semibold mb-1">Notes</p>
                <p className="text-sm text-gray-700">{viewAppt.notes}</p>
              </div>
            )}

            {/* Quick action buttons inside modal */}
            <div className="flex gap-2 pt-2">
              {viewAppt.status === 'pending' && (
                <button
                  onClick={() => {
                    setViewAppt(null);
                    openConfirm(viewAppt._id, 'confirm', viewAppt.patientName);
                  }}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl
                             font-semibold hover:bg-green-700 transition text-sm"
                >
                  ✅ Confirm Appointment
                </button>
              )}
              {viewAppt.status === 'confirmed' && (
                <button
                  onClick={() => {
                    setViewAppt(null);
                    openConfirm(viewAppt._id, 'complete', viewAppt.patientName);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl
                             font-semibold hover:bg-blue-700 transition text-sm"
                >
                  🎉 Mark as Complete
                </button>
              )}
              {['pending', 'confirmed'].includes(viewAppt.status) && (
                <button
                  onClick={() => {
                    setViewAppt(null);
                    openConfirm(viewAppt._id, 'cancel', viewAppt.patientName);
                  }}
                  className="flex-1 bg-red-50 text-red-600 border border-red-200
                             py-2.5 rounded-xl font-semibold hover:bg-red-100
                             transition text-sm"
                >
                  ❌ Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm/Cancel/Complete dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={
          confirmDialog.action === 'confirm'  ? 'Confirm Appointment'  :
          confirmDialog.action === 'complete' ? 'Mark as Complete'     :
                                                'Cancel Appointment'
        }
        message={
          confirmDialog.action === 'confirm'
            ? `Confirm appointment for ${confirmDialog.name}? They will be notified via email, SMS, and WhatsApp.`
            : confirmDialog.action === 'complete'
              ? `Mark ${confirmDialog.name}'s appointment as completed?`
              : `Cancel ${confirmDialog.name}'s appointment? They will be notified.`
        }
        confirmLabel={
          confirmDialog.action === 'confirm'  ? 'Yes, Confirm'  :
          confirmDialog.action === 'complete' ? 'Yes, Complete' :
                                                'Yes, Cancel'
        }
        variant={
          confirmDialog.action === 'cancel' ? 'danger' : 'info'
        }
        onConfirm={() =>
          updateStatus(
            confirmDialog.id,
            confirmDialog.action === 'confirm'  ? 'confirmed'  :
            confirmDialog.action === 'complete' ? 'completed'  :
                                                  'cancelled'
          )
        }
        onCancel={() => setConfirmDialog(d => ({ ...d, open: false }))}
      />
    </div>
  );
}
