'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface MedicalRecordFormProps {
  initial?: any;
  patients?: any[];
  doctors?: any[];
  onSuccess: (record: any) => void;
  onCancel: () => void;
}

export default function MedicalRecordForm({ initial, patients = [], doctors = [], onSuccess, onCancel }: MedicalRecordFormProps) {
  const isEdit = Boolean(initial?._id);
  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm({
    defaultValues: {
      prescription: [{ medicine: '', dosage: '', duration: '' }],
      ...(initial || {}),
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'prescription' });

  const onSubmit = async (data: any) => {
    try {
      const url    = isEdit ? `/api/records/${initial._id}` : '/api/records';
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      toast.success(isEdit ? 'Record updated!' : 'Record created!');
      onSuccess(result.record);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {initial?.appointmentId && <input type="hidden" {...register('appointmentId')} />}
      {initial?.patientId && <input type="hidden" {...register('patientId')} />}
      {initial?.doctorId && <input type="hidden" {...register('doctorId')} />}

      <div className="grid grid-cols-2 gap-4">
        {patients.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select {...register('patientId')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select patient</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
        )}
        {doctors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select {...register('doctorId')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
        <input {...register('diagnosis', { required: true })}
          placeholder="e.g. Dental caries in upper left molar"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
        <textarea {...register('treatment')} rows={2}
          placeholder="Treatment procedures performed..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Prescription */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Prescription</label>
          <button type="button" onClick={() => append({ medicine: '', dosage: '', duration: '' })}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
            <FaPlus size={10} /> Add Medicine
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-3 gap-2 items-end">
              <div>
                {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Medicine</label>}
                <input {...register(`prescription.${idx}.medicine`)}
                  placeholder="e.g. Amoxicillin"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Dosage</label>}
                <input {...register(`prescription.${idx}.dosage`)}
                  placeholder="e.g. 500mg twice daily"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-1">
                <div className="flex-1">
                  {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Duration</label>}
                  <input {...register(`prescription.${idx}.duration`)}
                    placeholder="e.g. 5 days"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(idx)}
                    className={`p-1.5 text-red-500 hover:bg-red-50 rounded-lg ${idx === 0 ? 'mt-4' : ''}`}>
                    <FaTrash size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea {...register('notes')} rows={2}
          placeholder="Additional notes, observations, follow-up instructions..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Next Visit Date</label>
        <input {...register('nextVisit')} type="date"
          min={new Date().toISOString().split('T')[0]}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition text-sm">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm disabled:opacity-50">
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Record' : 'Save Record'}
        </button>
      </div>
    </form>
  );
}
