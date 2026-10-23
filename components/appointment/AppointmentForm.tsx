// dental-clinic\components\appointment\AppointmentForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AppointmentCalendar from './AppointmentCalendar';
import TimeSlotPicker      from './TimeSlotPicker';
import { SERVICE_OPTIONS, TIME_SLOTS } from '@/lib/constants';
import { format } from 'date-fns';

interface AppointmentFormProps {
  onSuccess?: (appt: any) => void;
  compact?:   boolean;
}

const steps = ['Patient Info', 'Service & Doctor', 'Date & Time', 'Confirm'];

export default function AppointmentForm({ onSuccess, compact = false }: AppointmentFormProps) {
  const [step,    setStep]    = useState(0);
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [selSlot, setSelSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      patientName: '',
      phone:       '',
      email:       '',
      service:     '',
      doctorName:  '',
      notes:       '',
    },
  });

  const watchedValues = watch();
  const selectedDoctor = doctors.find(d => d.name === watchedValues.doctorName);

  const nextStep = async () => {
    let fields: any[] = [];
    if (step === 0) fields = ['patientName', 'phone'];
    if (step === 1) fields = ['service'];
    const ok = await trigger(fields);
    if (ok) setStep(s => s + 1);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setDoctorsLoading(true);
      try {
        const res = await fetch('/api/doctors?active=true');
        const data = await res.json();
        if (!mounted) return;
        setDoctors(data.doctors || []);
      } catch (e) {
        if (!mounted) return;
        setDoctors([]);
      } finally {
        if (mounted) setDoctorsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (data: any) => {
    if (!selDate) { toast.error('Please select a date'); return; }
    if (!selSlot) { toast.error('Please select a time slot'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...data,
          date:      format(selDate, 'yyyy-MM-dd'),
          timeSlot:  selSlot,
          doctorId:   selectedDoctor?._id,
          status:    'pending',
          bookedVia: 'website',
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      toast.success('Appointment booked! Redirecting to doctor profile...');
      onSuccess?.(result.appointment);
      // Redirect to doctor page after successful booking
      const doctorNameParam = encodeURIComponent(data.doctorName || 'available');
      setTimeout(() => {
        window.location.href = `/appointment/success?doctor=${doctorNameParam}&date=${format(selDate, 'yyyy-MM-dd')}&slot=${encodeURIComponent(selSlot)}`;
      }, 1500);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md ${compact ? 'p-4' : 'p-8'}`}>
      {/* Step indicator */}
      {!compact && (
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                  ${i < step  ? 'bg-blue-600 border-blue-600 text-white'
                  : i === step ? 'border-blue-600 text-blue-600'
                               : 'border-gray-300 text-gray-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0 – Patient Info */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('patientName', { required: 'Name is required' })}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.patientName && (
                  <p className="text-red-500 text-xs mt-1">{errors.patientName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' },
                  })}
                  placeholder="9876543210"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email', {
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 1 – Service & Doctor */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Service & Doctor</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Required <span className="text-red-500">*</span>
              </label>
              <select
                {...register('service', { required: 'Please select a service' })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a service…</option>
                {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.service && (
                <p className="text-red-500 text-xs mt-1">{errors.service.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Doctor
              </label>
              <div className="relative">
                <select
                  {...register('doctorName')}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No preference / Any available</option>
                  {!doctorsLoading && doctors.map(d => (
                    <option key={d._id} value={d.name}>
                      {d.name} — {d.specialization} {d.consultationFee ? `(₹${d.consultationFee})` : ''}
                    </option>
                  ))}
                </select>
                {doctorsLoading && (
                  <div className="absolute right-3 top-3 text-gray-400 text-xs">Loading…</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Describe your concern or any relevant dental history…"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2 – Date & Time */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Date & Time</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pick a Date</p>
                <AppointmentCalendar
                  selectedDate={selDate}
                  onDateSelect={setSelDate}
                  minDate={new Date()}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selDate
                    ? `Available Slots — ${format(selDate, 'EEE, dd MMM')}`
                    : 'Select a date first'}
                </p>
                {selDate ? (
                  <TimeSlotPicker
                    slots={TIME_SLOTS}
                    selected={selSlot}
                    onChange={setSelSlot}
                    doctorName={watchedValues.doctorName}
                    date={selDate}
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center bg-gray-50
                                  rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">← Choose a date</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 – Confirm */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Appointment</h2>
            <div className="bg-blue-50 rounded-2xl p-6 space-y-3">
              {[
                { label: 'Patient',  value: watchedValues.patientName },
                { label: 'Phone',    value: watchedValues.phone        },
                { label: 'Email',    value: watchedValues.email || '—' },
                { label: 'Service',  value: watchedValues.service      },
                { label: 'Doctor',   value: watchedValues.doctorName || 'Any available' },
                { label: 'Date',     value: selDate ? format(selDate, 'EEEE, dd MMMM yyyy') : '—' },
                { label: 'Time',     value: selSlot || '—' },
              ].map(row => (
                <div key={row.label}
                  className="flex justify-between items-center py-2 border-b border-blue-100 last:border-0">
                  <span className="text-sm text-gray-500 font-medium">{row.label}</span>
                  <span className="text-sm text-gray-800 font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
            {watchedValues.notes && (
              <div className="mt-3 bg-yellow-50 rounded-xl p-4">
                <p className="text-xs font-medium text-yellow-700 mb-1">Notes</p>
                <p className="text-sm text-gray-600">{watchedValues.notes}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4 text-center">
              By confirming, you agree to our cancellation policy (24-hour notice required).
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl
                         font-semibold hover:bg-gray-50 transition text-sm"
            >
              ← Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold
                         hover:bg-blue-700 transition text-sm"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold
                         hover:bg-green-700 transition text-sm disabled:opacity-50"
            >
              {loading ? 'Booking…' : '✓ Confirm Appointment'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
