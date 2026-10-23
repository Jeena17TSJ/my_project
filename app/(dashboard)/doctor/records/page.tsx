'use client';
import { useEffect, useState } from 'react';
import { FaFileMedical, FaPlus } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import MedicalRecordForm from '@/components/forms/MedicalRecordForm';
import { PageLoader } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function DoctorRecordsPage() {
  const [records,  setRecords]  = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected,  setSelected] = useState<any>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [rRes, pRes] = await Promise.all([
      fetch('/api/records'), fetch('/api/patients'),
    ]);
    const [rData, pData] = await Promise.all([rRes.json(), pRes.json()]);
    setRecords(rData.records   || []);
    setPatients(pData.patients || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
        <button onClick={() => { setSelected(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <FaPlus /> New Record
        </button>
      </div>

      {loading ? <PageLoader /> : records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <FaFileMedical className="text-5xl mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No records created yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r: any) => (
            <div key={r._id} className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{r.diagnosis}</h3>
                  <p className="text-sm text-blue-600">{r.patientId?.name || 'Unknown patient'}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      📅 {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    {r.treatment && <span className="text-xs text-gray-500 line-clamp-1">🔧 {r.treatment}</span>}
                    {r.nextVisit && (
                      <span className="text-xs text-orange-600">
                        🔁 {new Date(r.nextVisit).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => { setSelected(r); setShowModal(true); }}
                  className="text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition">
                  Edit
                </button>
              </div>
              {r.prescription?.length > 0 && (
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                  {r.prescription.map((p: any, i: number) => (
                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      💊 {p.medicine} {p.dosage}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={selected ? 'Edit Medical Record' : 'New Medical Record'} size="lg">
        <MedicalRecordForm
          initial={selected}
          patients={patients}
          onSuccess={() => { setShowModal(false); fetchAll(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
