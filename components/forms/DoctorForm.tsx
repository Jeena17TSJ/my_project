'use client';
// components/forms/DoctorForm.tsx
// Used in Admin panel to add doctors - creates both User + Doctor records
import { useState } from 'react';
import { useForm }  from 'react-hook-form';
import toast        from 'react-hot-toast';
import {
  FaUserMd, FaEnvelope, FaPhone, FaGraduationCap,
  FaStarHalfAlt, FaMoneyBillWave, FaCheck,
  FaEye, FaEyeSlash, FaPlus, FaTrash, FaImage,
} from 'react-icons/fa';

const SPECIALIZATIONS = [
  'General Dentistry',
  'General & Cosmetic Dentistry',
  'Orthodontics',
  'Oral Surgery & Implants',
  'Pediatric Dentistry',
  'Periodontics',
  'Endodontics',
  'Prosthodontics',
  'Oral Medicine',
];

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const DEFAULT_SLOTS = [
  '9:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM',
];

interface AddDoctorFormProps {
  initial?:   any;
  onSuccess:  (doctor: any) => void;
  onCancel:   () => void;
}

export default function AddDoctorForm({ initial, onSuccess, onCancel }: AddDoctorFormProps) {
  const isEdit = !!initial;
  const [tab,       setTab]       = useState<'profile'|'schedule'|'account'>('profile');
  const [showPass,  setShowPass]  = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(initial?.availableDays || []);
  const [slotMap,   setSlotMap]   = useState<Record<string, string[]>>(
    // Build initial slot map from availableSlots array
    (initial?.availableSlots || []).reduce((acc: any, s: any) => {
      acc[s.day] = s.slots || [];
      return acc;
    }, {})
  );

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name:            initial?.name            || '',
      specialization:  initial?.specialization  || '',
      qualification:   initial?.qualification   || '',
      experience:      initial?.experience      || '',
      consultationFee: initial?.consultationFee || 500,
      rating:          initial?.rating          || 4.5,
      bio:             initial?.bio             || '',
      image:           initial?.image           || '',
      email:           initial?.email           || '',
      phone:           initial?.phone           || '',
      password:        '',
    },
  });

  const imageValue = watch('image');

  // Toggle day selection
  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      const next = prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day];
      // If day removed, also clear its slots
      if (prev.includes(day)) {
        setSlotMap(m => { const n = { ...m }; delete n[day]; return n; });
      } else {
        // Add default slots for new day
        setSlotMap(m => ({ ...m, [day]: [...DEFAULT_SLOTS] }));
      }
      return next;
    });
  };

  // Toggle individual slot for a day
  const toggleSlot = (day: string, slot: string) => {
    setSlotMap(prev => {
      const current = prev[day] || [];
      return {
        ...prev,
        [day]: current.includes(slot)
          ? current.filter(s => s !== slot)
          : [...current, slot].sort((a, b) => {
              // Sort by time
              const toMin = (t: string) => {
                const [time, period] = t.split(' ');
                const [h, m] = time.split(':').map(Number);
                return (period === 'PM' && h !== 12 ? h + 12 : h) * 60 + m;
              };
              return toMin(a) - toMin(b);
            }),
      };
    });
  };

  const onSubmit = async (data: any) => {
    if (selectedDays.length === 0) {
      toast.error('Select at least one available day.');
      setTab('schedule');
      return;
    }

    // Build availableSlots array
    const availableSlots = selectedDays.map(day => ({
      day,
      slots: slotMap[day] || DEFAULT_SLOTS,
    }));

    const payload = {
      ...data,
      experience:      Number(data.experience)      || 0,
      consultationFee: Number(data.consultationFee) || 500,
      rating:          Number(data.rating)          || 4.5,
      availableDays:   selectedDays,
      availableSlots,
      isActive:        true,
    };

    // Remove password from payload if editing and blank
    if (isEdit && !data.password) delete payload.password;

    try {
      const url    = isEdit ? `/api/doctors/${initial._id}` : '/api/doctors';
      const method = isEdit ? 'PUT' : 'POST';

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');

      toast.success(
        isEdit
          ? 'Doctor updated successfully!'
          : `Doctor added! Login: ${data.email} / ${data.password}`
      );
      onSuccess(result.doctor);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleImageFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('Doctor image must be under 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValue('image', String(reader.result), { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { key: 'profile',  label: '1. Profile'  },
    { key: 'schedule', label: '2. Schedule' },
    { key: 'account',  label: '3. Account'  },
  ] as const;

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2
              ${tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* -- Tab 1: Profile --------------------------- */}
        {tab === 'profile' && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUserMd className="absolute left-3.5 top-3 text-gray-400" size={13} />
                <input
                  {...register('name', { required: 'Doctor name is required' })}
                  placeholder="Dr. John Smith"
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                    focus:outline-none focus:ring-2 transition
                    ${errors.name
                      ? 'border-red-300 focus:ring-red-400 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500'}`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Specialization <span className="text-red-500">*</span>
              </label>
              <select
                {...register('specialization', { required: 'Required' })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 transition
                  ${errors.specialization
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-blue-500'}`}
              >
                <option value="">Select specialization...</option>
                {SPECIALIZATIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.specialization && (
                <p className="text-red-500 text-xs mt-1">Required</p>
              )}
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Qualification
              </label>
              <div className="relative">
                <FaGraduationCap className="absolute left-3.5 top-3 text-gray-400" size={13} />
                <input
                  {...register('qualification')}
                  placeholder="e.g. BDS, MDS - Prosthodontics"
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Doctor Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Doctor Image
              </label>
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50
                                overflow-hidden flex items-center justify-center flex-shrink-0">
                  {imageValue ? (
                    <img
                      src={imageValue}
                      alt="Doctor preview"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <FaImage className="text-gray-300" size={24} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <FaImage className="absolute left-3.5 top-3 text-gray-400" size={12} />
                    <input
                      {...register('image')}
                      placeholder="Paste image URL or upload a photo"
                      className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2
                                      rounded-xl border border-gray-300 px-3 py-2 text-xs
                                      font-semibold text-gray-600 hover:bg-gray-50 transition">
                      <FaPlus size={10} />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleImageFile(e.target.files?.[0])}
                      />
                    </label>
                    {imageValue && (
                      <button
                        type="button"
                        onClick={() => setValue('image', '', { shouldDirty: true })}
                        className="inline-flex items-center gap-1 rounded-xl border
                                   border-red-200 px-3 py-2 text-xs font-semibold
                                   text-red-600 hover:bg-red-50 transition"
                      >
                        <FaTrash size={10} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience + Fee + Rating */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Experience (yrs)
                </label>
                <input
                  {...register('experience')}
                  type="number" min={0} max={50}
                  placeholder="10"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Consult Fee (Rs.)
                </label>
                <div className="relative">
                  <FaMoneyBillWave className="absolute left-3 top-3 text-gray-400" size={11} />
                  <input
                    {...register('consultationFee')}
                    type="number" min={0}
                    placeholder="500"
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-3 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <div className="relative">
                  <FaStarHalfAlt className="absolute left-3 top-3 text-gray-400" size={11} />
                  <input
                    {...register('rating')}
                    type="number" min={1} max={5} step={0.1}
                    placeholder="4.5"
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-3 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-3 text-gray-400" size={11} />
                  <input
                    {...register('phone')}
                    placeholder="+91 98765 43210"
                    className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                  {!isEdit && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-3 text-gray-400" size={11} />
                  <input
                    {...register('email', {
                      required: isEdit ? false : 'Email is required for login',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                    type="email"
                    placeholder="doctor@dentalcare.in"
                    disabled={isEdit}
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                      focus:outline-none focus:ring-2 transition
                      ${isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                      ${errors.email
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bio / About
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                placeholder="Brief description of the doctor's expertise, achievements and specialties..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setTab('schedule')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold
                           text-sm hover:bg-blue-700 transition">
                Next: Schedule
              </button>
            </div>
          </div>
        )}

        {/* -- Tab 2: Schedule -------------------------- */}
        {tab === 'schedule' && (
          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Available Days</h3>
              <p className="text-xs text-gray-400 mb-3">
                Select the days this doctor works. Then configure time slots per day.
              </p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day} type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border
                      transition-all
                      ${selectedDays.includes(day)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {selectedDays.length === 0 && (
                <p className="text-red-500 text-xs mt-2">
                  Please select at least one working day.
                </p>
              )}
            </div>

            {/* Slot config per day */}
            {selectedDays.map(day => (
              <div key={day} className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-700 text-sm">{day}</h4>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setSlotMap(m => ({ ...m, [day]: [...DEFAULT_SLOTS] }))}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button type="button"
                      onClick={() => setSlotMap(m => ({ ...m, [day]: [] }))}
                      className="text-xs text-red-500 hover:text-red-700 font-medium">
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DEFAULT_SLOTS.map(slot => {
                    const active = slotMap[day]?.includes(slot);
                    return (
                      <button
                        key={slot} type="button"
                        onClick={() => toggleSlot(day, slot)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition
                          ${active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {slotMap[day]?.length || 0} slot{slotMap[day]?.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            ))}

            <div className="flex gap-3 justify-between">
              <button type="button" onClick={() => setTab('profile')}
                className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl
                           font-semibold text-sm hover:bg-gray-50 transition">
                Back
              </button>
              <button type="button" onClick={() => setTab('account')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold
                           text-sm hover:bg-blue-700 transition">
                Next: Account
              </button>
            </div>
          </div>
        )}

        {/* -- Tab 3: Login Account --------------------- */}
        {tab === 'account' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">
                Doctor Login Account
              </p>
              <p className="text-xs text-blue-600">
                {isEdit
                  ? 'Leave password blank to keep the existing password.'
                  : 'An account will be created so the doctor can log in to their dashboard.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Login Email
              </label>
              <input
                value={watch('email')}
                readOnly
                className="w-full border border-gray-200 bg-gray-100 text-gray-500
                           rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
              <p className="text-gray-400 text-xs mt-1">
                Set in Profile tab
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password{' '}
                {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && (
                  <span className="text-gray-400 font-normal">
                    (blank = keep current)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: isEdit ? false : 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 chars, include uppercase + number"
                  className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm
                    focus:outline-none focus:ring-2 transition
                    ${errors.password
                      ? 'border-red-300 focus:ring-red-400 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500'}`}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message as string}
                </p>
              )}
              {!isEdit && (
                <p className="text-xs text-gray-400 mt-1">
                  Suggested: Doctor@{new Date().getFullYear()}
                </p>
              )}
            </div>

            {/* Summary before submit */}
            <div className="bg-gray-50 border rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Summary
              </p>
              {[
                { label: 'Name',           value: watch('name')           || '-' },
                { label: 'Specialization', value: watch('specialization') || '-' },
                { label: 'Experience',     value: watch('experience') ? `${watch('experience')} years` : '-' },
                { label: 'Fee',            value: watch('consultationFee') ? `Rs. ${watch('consultationFee')}/visit` : '-' },
                { label: 'Available Days', value: selectedDays.join(', ') || '-' },
                { label: 'Login Email',    value: watch('email')           || '-' },
              ].map(row => (
                <div key={row.label}
                  className="flex justify-between text-sm border-b border-gray-100
                             pb-1.5 last:border-0">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-800 text-right max-w-xs truncate">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setTab('schedule')}
                className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl
                           font-semibold text-sm hover:bg-gray-50 transition">
                Back
              </button>
              <button type="button" onClick={onCancel}
                className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl
                           font-semibold text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold
                           text-sm hover:bg-green-700 transition disabled:opacity-50
                           flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent
                                     rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheck size={12} />
                    {isEdit ? 'Update Doctor' : 'Add Doctor'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
