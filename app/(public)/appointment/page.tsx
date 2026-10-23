'use client';
// app/(public)/appointment/page.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { SERVICE_OPTIONS } from '@/lib/constants';
import {
  FaCalendarCheck, FaUserMd, FaTooth,
  FaPhone, FaEnvelope, FaUser,
  FaExclamationTriangle, FaCheckCircle,
  FaChevronLeft, FaChevronRight,
  FaLock,
  FaShieldAlt, FaStar, FaClock, FaMapMarkerAlt,
} from 'react-icons/fa';
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth,
  isSameDay, isToday, isBefore,
  startOfDay, getDay,
} from 'date-fns';

// ── Types ─────────────────────────────────────────────────────
interface Doctor {
  _id:             string;
  name:            string;
  specialization:  string;
  consultationFee: number;
  availableDays:   string[];
  availableSlots:  { day: string; slots: string[] }[];
  experience:      number;
  qualification:   string;
  rating:          number;
}

interface DayInfo {
  available:    boolean;
  onLeave:      boolean;
  reason?:      string;
  dayName?:     string;
  slots?:       string[];
  bookedSlots?: string[];
  freeSlots?:   string[];
  freeCount?:   number;
  totalSlots?:  number;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_NAMES = [
  'Sunday','Monday','Tuesday',
  'Wednesday','Thursday','Friday','Saturday',
];

// ════════════════════════════════════════════════════════════
// SMART CALENDAR
// ════════════════════════════════════════════════════════════
interface SmartCalendarProps {
  doctor:       Doctor;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availability: { date: string; available: boolean; onLeave: boolean; freeSlots?: number; totalSlots?: number }[];
  loading:      boolean;
}

function SmartCalendar({
  doctor, selectedDate, onDateSelect, availability, loading,
}: SmartCalendarProps) {
  const [viewMonth, setViewMonth] = useState(new Date());

  const getDayInfo = (date: Date) =>
    availability.find(a => a.date === format(date, 'yyyy-MM-dd'));

  const isDateDisabled = (date: Date): boolean => {
    if (isBefore(startOfDay(date), startOfDay(new Date()))) return true;
    const info = getDayInfo(date);
    if (!info) return true;
    return !info.available;
  };

  const monthStart = startOfMonth(viewMonth);
  const monthEnd   = endOfMonth(viewMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad   = getDay(monthStart);
  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevDisabled = isBefore(
    endOfMonth(subMonths(viewMonth, 1)),
    new Date()
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <button type="button"
          onClick={() => setViewMonth(m => subMonths(m, 1))}
          disabled={prevDisabled}
          className="p-2 rounded-xl hover:bg-gray-200 transition text-gray-600
                     disabled:opacity-30 disabled:cursor-not-allowed">
          <FaChevronLeft size={11} />
        </button>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent
                             rounded-full animate-spin" />
          )}
          <span className="font-bold text-gray-800 text-sm">
            {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </span>
        </div>
        <button type="button"
          onClick={() => setViewMonth(m => addMonths(m, 1))}
          className="p-2 rounded-xl hover:bg-gray-200 transition text-gray-600">
          <FaChevronRight size={11} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b">
        {DAY_HEADS.map(d => (
          <div key={d}
            className={`text-center py-2 text-xs font-bold
              ${d === 'Sun' || d === 'Sat' ? 'text-red-400' : 'text-gray-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;

          const dateStr    = format(day, 'yyyy-MM-dd');
          const info       = getDayInfo(day);
          const disabled   = isDateDisabled(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrDay  = isToday(day);
          const isPast     = isBefore(startOfDay(day), startOfDay(new Date()));
          const isOffDay   = !info?.available && !isPast;

          const freeCount  = info?.freeSlots ?? 0;
          const dotColor   = freeCount === 0 ? '' :
                             freeCount <= 2   ? 'bg-orange-400' : 'bg-green-500';

          let cellClass = `relative flex flex-col items-center justify-center
            h-10 w-full rounded-xl text-xs transition-all `;

          if (isSelected) {
            cellClass += 'bg-blue-600 text-white shadow-md scale-110 z-10 font-bold';
          } else if (isPast || disabled) {
            if (isOffDay) {
              cellClass += 'bg-gray-50 text-gray-300 cursor-not-allowed';
            } else {
              cellClass += 'text-gray-300 cursor-not-allowed';
            }
          } else if (isCurrDay) {
            cellClass += 'bg-blue-50 text-blue-700 border-2 border-blue-300 font-bold cursor-pointer hover:scale-105';
          } else {
            const bgColor = freeCount === 0 ? 'bg-orange-50' :
                            freeCount <= 2  ? 'bg-yellow-50' : 'bg-green-50';
            cellClass += `${bgColor} text-gray-700 font-semibold cursor-pointer hover:scale-105 hover:shadow-sm`;
          }

          const titleText = isPast          ? 'Past date' :
                            isOffDay        ? `Not working on ${DAY_NAMES[getDay(day)]}s` :
                            freeCount === 0 ? 'Fully booked' :
                            `${freeCount} slot${freeCount !== 1 ? 's' : ''} available`;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onDateSelect(day)}
              title={titleText}
              className={cellClass}
            >
              <span className="leading-none">{format(day, 'd')}</span>
              {isOffDay && !isSelected && (
                <FaLock size={6} className="text-gray-300 mt-0.5" />
              )}
              {!disabled && !isSelected && freeCount > 0 && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${dotColor}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-600 rounded" /> Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-50 border border-green-300 rounded" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-50 border border-yellow-300 rounded" />
          Few slots
        </span>
        <span className="flex items-center gap-1">
          <FaLock size={8} className="text-gray-300" /> Off day
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function AppointmentPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isPatientBooking = userRole === 'patient';
  const backHomeHref = isPatientBooking ? '/patient' : '/';
  const [doctors,         setDoctors]         = useState<Doctor[]>([]);
  const [doctorsLoading,  setDoctorsLoading]  = useState(true);
  const [selectedDoc,     setSelectedDoc]     = useState<Doctor | null>(null);
  const [selectedDate,    setSelectedDate]    = useState<Date | null>(null);
  const [availability,    setAvailability]    = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [dayInfo,         setDayInfo]         = useState<DayInfo | null>(null);
  const [slotsLoading,    setSlotsLoading]    = useState(false);
  const [selectedSlot,    setSelectedSlot]    = useState('');
  const [conflictError,   setConflictError]   = useState('');
  const [submitting,      setSubmitting]      = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [bookedRef,       setBookedRef]       = useState('');
  const doctorPrefillApplied = useRef(false);

  const {
    register, handleSubmit, watch, reset,
    setValue, formState: { errors },
  } = useForm({
    defaultValues: {
      patientName: '', phone: '', email: '',
      service: '', doctorName: '', notes: '',
    },
  });

  const watchDoctor = watch('doctorName');

  useEffect(() => {
    if (!isPatientBooking || !session?.user) return;
    setValue('patientName', session.user.name || '');
    setValue('email', session.user.email || '');
  }, [isPatientBooking, session, setValue]);

  // ── 1. Load doctors ───────────────────────────────────────
  const loadDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    try {
      const res  = await fetch('/api/doctors?active=true');
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch {
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  // ── 2. Load calendar availability when doctor changes ─────
  const loadCalendarAvailability = useCallback(async (doc: Doctor) => {
    setCalendarLoading(true);
    setAvailability([]);
    try {
      const res  = await fetch(`/api/doctors/${doc._id}/availability?days=60`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setAvailability(data.availableDates || []);
    } catch {
      const today = new Date();
      const basic: any[] = [];
      for (let i = 0; i < 60; i++) {
        const d       = new Date(today);
        d.setDate(today.getDate() + i);
        const dayName = DAY_NAMES[d.getDay()];
        const dateStr = format(d, 'yyyy-MM-dd');
        const avail   = doc.availableDays.includes(dayName);
        basic.push({
          date:      dateStr,
          dayName,
          available: avail,
          onLeave:   false,
          freeSlots: avail ? 5 : 0,
        });
      }
      setAvailability(basic);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  // ── 3. Handle doctor selection ─────────────────────────────
  const handleDoctorChange = useCallback(async (name: string) => {
    setValue('doctorName', name);
    const doc = doctors.find(d => d.name === name) || null;
    setSelectedDoc(doc);
    setSelectedDate(null);
    setSelectedSlot('');
    setDayInfo(null);
    setConflictError('');
    setAvailability([]);
    if (doc) await loadCalendarAvailability(doc);
  }, [doctors, loadCalendarAvailability, setValue]);

  useEffect(() => {
    if (doctorPrefillApplied.current || doctorsLoading || doctors.length === 0) return;

    const searchParams = new URLSearchParams(window.location.search);
    const doctorId = searchParams.get('doctorId');
    const doctorName = searchParams.get('doctorName');
    if (!doctorId && !doctorName) {
      doctorPrefillApplied.current = true;
      return;
    }

    const requestedDoctor = doctors.find(d => d._id === doctorId)
      || doctors.find(d => d.name.toLowerCase() === doctorName?.toLowerCase());

    doctorPrefillApplied.current = true;
    if (requestedDoctor) handleDoctorChange(requestedDoctor.name);
  }, [doctors, doctorsLoading, handleDoctorChange]);

  // ── 4. Handle date selection ───────────────────────────────
  const handleDateSelect = useCallback(async (date: Date) => {
    if (!selectedDoc) return;
    setSelectedDate(date);
    setSelectedSlot('');
    setConflictError('');
    setSlotsLoading(true);
    setDayInfo(null);

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res     = await fetch(
        `/api/doctors/${selectedDoc._id}/availability?date=${dateStr}`,
        { cache: 'no-store' }
      );
      const data    = await res.json();
      setDayInfo(data);
    } catch {
      setDayInfo(null);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedDoc]);

  // ── 5. Submit ──────────────────────────────────────────────
  const onSubmit = async (formData: any) => {
    if (!selectedSlot) { toast.error('Please select a time slot.'); return; }
    if (!selectedDate) { toast.error('Please select a date.');      return; }
    setSubmitting(true);
    setConflictError('');

    try {
      const res = await fetch('/api/appointments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...formData,
          date:      format(selectedDate, 'yyyy-MM-dd'),
          timeSlot:  selectedSlot,
          doctorId:   selectedDoc?._id,
          status:    'pending',
          bookedVia: isPatientBooking ? 'patient' : 'website',
        }),
      });
      const result = await res.json();

      if (res.status === 409) {
        setConflictError(result.error);
        if (result.conflictSlot) {
          setSelectedSlot('');
          if (selectedDate) handleDateSelect(selectedDate);
        }
        return;
      }
      if (!res.ok) throw new Error(result.error || 'Booking failed');

      setBookedRef(result.appointment?._id?.slice(-8).toUpperCase() || '--------');
      setSuccess(true);
      setSelectedDate(null);
      setSelectedSlot('');
      setSelectedDoc(null);
      reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_38%,#f8fafc_100%)]">
      <section className="relative overflow-hidden bg-slate-950 px-4 py-16 text-white">
        <img
          src="/gallery/reception_area.webp"
          alt="DentalCare reception area"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/40" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-100 ring-1 ring-white/15">
              <FaCalendarCheck size={12} /> Easy Online Booking
            </p>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Reserve your dental visit in minutes
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-blue-50/90">
              Choose your dentist, see live availability, and request a convenient slot. Our team confirms every booking by message.
            </p>
            <div className="mt-7 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: <FaShieldAlt />, label: 'Trusted care' },
                { icon: <FaClock />, label: 'Live slots' },
                { icon: <FaStar />, label: 'Expert doctors' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold ring-1 ring-white/15">
                  <span className="text-blue-200">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-100/60">
              <img
                src="/herosection/dentalsmile.jpg"
                alt="Smiling dental patient"
                className="h-56 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-xl font-extrabold text-gray-900">Comfort-first appointments</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  From checkups to urgent dental concerns, our team helps you pick the right doctor and time.
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    'Live doctor availability',
                    'Transparent consultation fees',
                    'Confirmation by Email, SMS and WhatsApp',
                  ].map(text => (
                    <div key={text} className="flex items-start gap-2 text-sm text-gray-700">
                      <FaCheckCircle className="mt-0.5 flex-shrink-0 text-green-500" size={14} />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">Clinic Info</p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" size={13} />
                  Koramangala, Bengaluru
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-blue-500" size={13} />
                  +91-80-9999-0000
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-blue-500" size={13} />
                  Mon-Sat, 9AM-7PM
                </div>
              </div>
            </div> */}
          </aside>

          <div>

        {/* Success */}
        {success && (
          <div className="bg-white rounded-3xl shadow-xl border border-green-100
                          p-10 text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                            justify-center mx-auto mb-5">
              <FaCheckCircle className="text-green-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
              Appointment Booked! 🎉
            </h2>
            <div className="bg-gray-50 rounded-xl py-2 px-4 inline-block mb-4">
              <span className="text-sm text-gray-500">Reference: </span>
              <span className="font-bold text-blue-600">#{bookedRef}</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Pending admin confirmation. You&apos;ll be notified via{' '}
              <strong>Email</strong>, <strong>SMS</strong> &amp;{' '}
              <strong>WhatsApp</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setSuccess(false)}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold
                           hover:bg-blue-700 transition">
                Book Another
              </button>
              <a href={backHomeHref}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl
                           font-bold hover:bg-gray-50 transition text-center">
                Back to Home
              </a>
            </div>
          </div>
        )}

        {/* Conflict error */}
        {conflictError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6
                          flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700 text-sm">Slot Not Available</p>
              <p className="text-red-600 text-sm mt-0.5">{conflictError}</p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)}
            className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-100/70">

            {/* ── Section 1 — Patient Info ── */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">Appointment Request</p>
              <h2 className="mt-1 text-2xl font-extrabold">Tell us when you would like to visit</h2>
              <p className="mt-2 text-sm text-blue-50">Complete the form below and our team will confirm your slot.</p>
            </div>

            {/* ── Section 1 — Patient Info ── */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-50">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-5">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center
                                 justify-center text-sm font-bold">1</span>
                Patient Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-3 text-gray-400" size={12} />
                    <input
                      {...register('patientName', { required: 'Name is required' })}
                      placeholder="John Doe"
                      readOnly={isPatientBooking}
                      className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2 transition
                        ${isPatientBooking ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
                        ${errors.patientName
                          ? 'border-red-300 bg-red-50 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                  </div>
                  {errors.patientName && (
                    <p className="text-red-500 text-xs mt-1">{errors.patientName.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-3 text-gray-400" size={11} />
                    <input
                      type="tel"
                      inputMode="numeric"
                      {...register('phone', {
                        required: 'Phone is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' },
                      })}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2 transition
                        ${errors.phone
                          ? 'border-red-300 bg-red-50 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email{' '}
                    <span className="text-gray-400 font-normal">(for confirmation)</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3 text-gray-400" size={11} />
                    <input
                      {...register('email', {
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                      })}
                      type="email"
                      placeholder="you@example.com"
                      readOnly={isPatientBooking}
                      className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2 transition
                        ${isPatientBooking ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
                        ${errors.email
                          ? 'border-red-300 bg-red-50 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2 — Service & Doctor ── */}
            <div className="px-8 py-6 border-b border-gray-50">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-5">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center
                                 justify-center text-sm font-bold">2</span>
                Service &amp; Doctor
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Service Required <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaTooth className="absolute left-3.5 top-3 text-gray-400" size={12} />
                  <select
                    {...register('service', { required: 'Please select a service' })}
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                      focus:outline-none focus:ring-2 transition appearance-none
                      ${errors.service ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
                  >
                    <option value="">Select a service…</option>
                    {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.service && (
                  <p className="text-red-500 text-xs mt-1">{errors.service.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Select Doctor <span className="text-red-500">*</span>
                </label>

                {doctorsLoading ? (
                  <div className="w-full border border-gray-200 rounded-xl px-4 py-3
                                  bg-gray-50 flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600
                                     rounded-full animate-spin" />
                    Loading doctors…
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <FaUserMd className="absolute left-3.5 top-3 text-gray-400" size={12} />
                      <select
                        {...register('doctorName', { required: 'Please select a doctor' })}
                        onChange={e => handleDoctorChange(e.target.value)}
                        className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                          focus:outline-none focus:ring-2 transition appearance-none
                          ${errors.doctorName ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
                      >
                        <option value="">Choose a doctor…</option>
                        {doctors.map(d => (
                          <option key={d._id} value={d.name}>
                            {d.name} — {d.specialization}
                            {' '}(₹{d.consultationFee?.toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.doctorName && (
                      <p className="text-red-500 text-xs mt-1">{errors.doctorName.message as string}</p>
                    )}
                    {!errors.doctorName && doctors.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Available doctors: {doctors.map(d => d.name).join(', ')}.
                      </p>
                    )}
                  </>
                )}

                {/* Doctor card */}
                {selectedDoc && (
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center
                                      justify-center text-white font-bold flex-shrink-0">
                        {selectedDoc.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{selectedDoc.name}</p>
                        <p className="text-blue-600 text-xs">{selectedDoc.specialization}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                          <span>⭐ {selectedDoc.rating}/5</span>
                          <span>🏥 {selectedDoc.experience} yrs</span>
                          <span className="font-bold text-green-700">
                            ₹{selectedDoc.consultationFee?.toLocaleString('en-IN')}/visit
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Works on: <strong>{selectedDoc.availableDays?.join(', ')}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 3 — Calendar + Slots ── */}
            <div className="px-8 py-6 border-b border-gray-50">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-5">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center
                                 justify-center text-sm font-bold">3</span>
                Choose Date &amp; Time
              </h2>

              {!selectedDoc ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200
                                rounded-2xl p-10 text-center">
                  <FaUserMd className="text-gray-300 text-4xl mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">
                    Select a doctor above to see their available dates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Calendar */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Select a Date</p>
                    <SmartCalendar
                      doctor={selectedDoc}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      availability={availability}
                      loading={calendarLoading}
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      {selectedDate
                        ? `Slots — ${format(selectedDate, 'EEE, dd MMM')}`
                        : 'Select a date first'}
                    </p>

                    {/* No date chosen yet */}
                    {!selectedDate && (
                      <div className="h-48 flex items-center justify-center bg-gray-50
                                      rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">← Choose a date</p>
                      </div>
                    )}

                    {/* Loading slots */}
                    {selectedDate && slotsLoading && (
                      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl">
                        <span className="w-6 h-6 border-2 border-blue-400 border-t-transparent
                                         rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Doctor not working that day */}
                    {selectedDate && !slotsLoading && dayInfo && !dayInfo.available && (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl
                                      p-5 text-center">
                        <p className="text-orange-700 font-semibold text-sm">
                          {selectedDoc.name} does not work on this day.
                        </p>
                        <p className="text-orange-600 text-xs mt-1">
                          Available: <strong>{selectedDoc.availableDays?.join(', ')}</strong>
                        </p>
                      </div>
                    )}

                    {/* ── Slot grid ── */}
                    {selectedDate && !slotsLoading && dayInfo?.available && (
                      <>
                        {/* Summary bar */}
                        <div className="flex justify-between mb-2 text-xs text-gray-400">
                          <span>
                            {dayInfo.freeCount ?? 0} of {dayInfo.totalSlots ?? 0} slots free
                          </span>
                          {(dayInfo.bookedSlots?.length ?? 0) > 0 && (
                            <span className="text-red-500 flex items-center gap-1">
                              <FaLock size={9} />
                              {dayInfo.bookedSlots?.length} booked
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {(dayInfo.slots || []).map(slot => {
                            const bookedSet  = new Set(
                              (dayInfo.bookedSlots || []).map((s: string) => s.trim().toLowerCase())
                            );
                            const isBooked   = bookedSet.has(slot.trim().toLowerCase());
                            const isSelected = selectedSlot === slot;

                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                aria-disabled={isBooked}
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setConflictError('');
                                }}
                                title={isBooked ? 'Already booked' : slot}
                                className={`
                                  relative py-3 rounded-xl text-xs font-bold border transition-all
                                  ${isBooked
                                    ? 'bg-red-600 text-white border-red-600 cursor-not-allowed pointer-events-none'
                                    : isSelected
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700'
                                  }
                                `}
                              >
                                {isBooked && (
                                  <FaLock size={7} className="absolute top-1 right-1 text-white" />
                                )}
                                <span>{slot}</span>
                                {isBooked && (
                                  <span className="block text-xs text-white leading-tight mt-0.5">
                                    Booked
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Slot legend */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-blue-600 rounded" /> Selected
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-white border border-gray-300 rounded" /> Available
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-red-600 rounded" /> Booked
                          </span>
                        </div>

                        {!selectedSlot && (
                          <p className="text-red-500 text-xs mt-2">Please select a time slot.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 4 — Notes + Submit ── */}
            <div className="px-8 py-6 bg-gradient-to-b from-gray-50 to-blue-50/50">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Notes{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Describe your concern or any relevant dental history…"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Booking summary */}
              {watchDoctor && selectedDate && selectedSlot && (
                <div className="bg-white border border-blue-100 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Booking Summary
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: 'Doctor',  value: watchDoctor },
                      { label: 'Date',    value: format(selectedDate, 'EEE, dd MMM yyyy') },
                      { label: 'Time',    value: selectedSlot },
                      { label: 'Service', value: watch('service') || '—' },
                    ].map(r => (
                      <div key={r.label}>
                        <p className="text-xs text-gray-400">{r.label}</p>
                        <p className="font-semibold text-gray-800">{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedSlot || !selectedDate}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold
                           text-base hover:bg-blue-700 transition disabled:opacity-50
                           disabled:cursor-not-allowed shadow-lg shadow-blue-200
                           flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent
                                     rounded-full animate-spin" />
                    Booking…
                  </>
                ) : (
                  <>
                    <FaCalendarCheck size={16} />
                    Confirm Appointment
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Confirmed via Email, SMS &amp; WhatsApp after admin approval
              </p>
            </div>

          </form>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
