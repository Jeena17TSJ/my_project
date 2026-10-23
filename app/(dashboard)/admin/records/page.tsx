'use client';
import { useEffect, useState } from 'react';
import { FaFileMedical, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import MedicalRecordForm from '@/components/forms/MedicalRecordForm';
import { PageLoader } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminRecordsPage() {
  const [records,  setRecords]  = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors,  setDoctors]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewRecord,  setViewRecord]  = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [rRes, pRes, dRes] = await Promise.all([
      fetch('/api/records'), fetch('/api/patients'), fetch('/api/doctors'),
    ]);
    const [rData, pData, dData] = await Promise.all([rRes.json(), pRes.json(), dRes.json()]);
    setRecords(rData.records   || []);
    setPatients(pData.patients || []);
    setDoctors(dData.doctors   || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/records/${deleteTarget}`, { method: 'DELETE' });
    toast.success('Record deleted');
    setShowConfirm(false);
    fetchAll();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <FaPlus /> New Record
        </button>
      </div>

      {loading ? <PageLoader /> : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Patient', 'Doctor', 'Diagnosis', 'Treatment', 'Next Visit', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  <FaFileMedical className="text-4xl mx-auto mb-2 opacity-30" />
                  <p>No medical records found.</p>
                </td></tr>
              ) : records.map((r: any) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {r.patientId?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.doctorId?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{r.diagnosis}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.treatment || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.nextVisit ? new Date(r.nextVisit).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewRecord(r)}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="View">
                        <FaEye size={12} />
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(r._id); setShowConfirm(true); }}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Delete">
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Record Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title="New Medical Record" size="lg">
        <MedicalRecordForm
          patients={patients} doctors={doctors}
          onSuccess={() => { setShowModal(false); fetchAll(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* View Record Modal */}
      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)}
        title="Medical Record Details" size="lg">
        {viewRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Patient',   value: viewRecord.patientId?.name },
                { label: 'Doctor',    value: viewRecord.doctorId?.name },
                { label: 'Diagnosis', value: viewRecord.diagnosis },
                { label: 'Treatment', value: viewRecord.treatment },
                { label: 'Next Visit', value: viewRecord.nextVisit ? new Date(viewRecord.nextVisit).toLocaleDateString('en-IN') : 'Not scheduled' },
                { label: 'Created',   value: new Date(viewRecord.createdAt).toLocaleDateString('en-IN') },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800">{f.value || '—'}</p>
                </div>
              ))}
            </div>

            {viewRecord.prescription?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Prescription</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Medicine', 'Dosage', 'Duration'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-gray-600 font-medium text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {viewRecord.prescription.map((p: any, i: number) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-gray-800">{p.medicine}</td>
                          <td className="px-3 py-2 text-gray-600">{p.dosage}</td>
                          <td className="px-3 py-2 text-gray-600">{p.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewRecord.notes && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Notes</p>
                <p className="text-sm text-gray-700">{viewRecord.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm} title="Delete Record"
        message="This will permanently delete this medical record."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}