'use client';
// components/forms/AddPatientForm.tsx
// Used in Admin panel — creates Patient record + optional User account
import { useState } from 'react';
import { useForm }  from 'react-hook-form';
import toast        from 'react-hot-toast';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaExclamationTriangle, FaCheck, FaEye, FaEyeSlash,
  FaTint, FaCalendarAlt, FaUserFriends,
} from 'react-icons/fa';

const BLOOD_GROUPS  = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const RELATIONS     = ['Spouse','Parent','Child','Sibling','Friend','Guardian','Other'];

interface AddPatientFormProps {
  initial?:  any;
  onSuccess: (patient: any) => void;
  onCancel:  () => void;
}

export default function AddPatientForm({ initial, onSuccess, onCancel }: AddPatientFormProps) {
  const isEdit = !!initial;
  const [tab,      setTab]      = useState<'basic'|'medical'|'emergency'|'account'>('basic');
  const [showPass, setShowPass] = useState(false);
  const [createAccount, setCreateAccount] = useState(!isEdit);

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      // Basic
      name:        initial?.name        || '',
      email:       initial?.email       || '',
      phone:       initial?.phone       || '',
      gender:      initial?.gender      || '',
      dob:         initial?.dob         ? initial.dob.split('T')[0] : '',
      bloodGroup:  initial?.bloodGroup  || '',
      address:     initial?.address     || '',
      // Medical
      allergies:      initial?.allergies?.join(', ')          || '',
      medicalHistory: initial?.medicalHistory                 || '',
      // Emergency
      emergencyName:     initial?.emergencyContact?.name     || '',
      emergencyPhone:    initial?.emergencyContact?.phone    || '',
      emergencyRelation: initial?.emergencyContact?.relation || '',
      // Account
      password: '',
    },
  });

  const watchEmail = watch('email');
  const watchName  = watch('name');

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {
        name:        data.name.trim(),
        email:       data.email.trim().toLowerCase(),
        phone:       data.phone.trim(),
        gender:      data.gender,
        dob:         data.dob         || undefined,
        bloodGroup:  data.bloodGroup,
        address:     data.address.trim(),
        allergies:   data.allergies
          ? data.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        medicalHistory: data.medicalHistory.trim(),
        emergencyContact: {
          name:     data.emergencyName.trim(),
          phone:    data.emergencyPhone.trim(),
          relation: data.emergencyRelation,
        },
      };

      // If creating a portal account for the patient
      if (createAccount && data.email && data.password) {
        payload.createAccount = true;
        payload.password      = data.password;
      }

      const url    = isEdit ? `/api/patients/${initial._id}` : '/api/patients';
      const method = isEdit ? 'PUT' : 'POST';

      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');

      toast.success(isEdit ? 'Patient updated!' : 'Patient added successfully!');
      onSuccess(result.patient);
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    }
  };

  const tabs = [
    { key: 'basic',     label: '1. Basic'     },
    { key: 'medical',   label: '2. Medical'   },
    { key: 'emergency', label: '3. Emergency' },
    { key: 'account',   label: '4. Account'   },
  ] as const;

  return (
    <div>
      {/* Tab nav */}
      <div className="flex border-b mb-5 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2
              whitespace-nowrap min-w-0
              ${tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── Tab 1: Basic Info ──────────────────────── */}
        {tab === 'basic' && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-3 text-gray-400" size={12} />
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Jane Doe"
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                    focus:outline-none focus:ring-2 transition
                    ${errors.name
                      ? 'border-red-300 focus:ring-red-400 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500'}`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>
              )}
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-3 text-gray-400" size={11} />
                  <input
                    {...register('phone', {
                      pattern: {
                        value:   /^[0-9+\s\-()]{7,15}$/,
                        message: 'Invalid phone',
                      },
                    })}
                    placeholder="9876543210"
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                      focus:outline-none focus:ring-2 transition
                      ${errors.phone
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-3 text-gray-400" size={11} />
                  <input
                    {...register('email', {
                      pattern: {
                        value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email',
                      },
                    })}
                    type="email"
                    placeholder="patient@email.com"
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm
                      focus:outline-none focus:ring-2 transition
                      ${errors.email
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                </div>
              </div>
            </div>

            {/* Gender + DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Gender
                </label>
                <select {...register('gender')}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3.5 top-3 text-gray-400" size={11} />
                  <input
                    {...register('dob')}
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Blood Group
              </label>
              <div className="relative">
                <FaTint className="absolute left-3.5 top-3 text-red-400" size={11} />
                <select {...register('bloodGroup')}
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select blood group…</option>
                  {BLOOD_GROUPS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3.5 top-3 text-gray-400" size={11} />
                <textarea
                  {...register('address')}
                  rows={2}
                  placeholder="123 Main Street, Bengaluru…"
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                             resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setTab('medical')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold
                           text-sm hover:bg-blue-700 transition">
                Next: Medical →
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 2: Medical ─────────────────────────── */}
        {tab === 'medical' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Known Allergies
                <span className="text-gray-400 font-normal ml-1">(comma-separated)</span>
              </label>
              <input
                {...register('allergies')}
                placeholder="e.g. Penicillin, Latex, Aspirin"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {...register('medicalHistory')}
                rows={5}
                placeholder="Previous dental procedures, current medications, systemic conditions (e.g. diabetes, hypertension), past surgeries, implants…"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {watch('allergies') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3
                              flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={12} />
                <p className="text-yellow-700 text-xs">
                  Allergy information will be prominently flagged in the patient
                  profile for all treating staff.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-between">
              <button type="button" onClick={() => setTab('basic')}
                className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl
                           font-semibold text-sm hover:bg-gray-50 transition">
                ← Back
              </button>
              <button type="button" onClick={() => setTab('emergency')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold
                           text-sm hover:bg-blue-700 transition">
                Next: Emergency →
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 3: Emergency Contact ───────────────── */}
        {tab === 'emergency' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-sm text-blue-700 font-medium">
                Emergency contact details — notified if patient is unreachable
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contact Name
              </label>
              <div className="relative">
                <FaUserFriends className="absolute left-3.5 top-3 text-gray-400" size={12} />
                <input
                  {...register('emergencyName')}
                  placeholder="Suresh Kumar"
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3.5 top-3 text-gray-400" size={11} />
                <input
                  {...register('emergencyPhone')}
                  placeholder="9876543210"
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Relationship to Patient
              </label>
              <select {...register('emergencyRelation')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select…</option>
                {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex gap-3 justify-between">
              <button type="button" onClick={() => setTab('medical')}
                className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl
                           font-semibold text-sm hover:bg-gray-50 transition">
                ← Back
              </button>
              <button type="button" onClick={() => setTab('account')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold
                           text-sm hover:bg-blue-700 transition">
                Next: Account →
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 4: Patient Portal Account ─────────── */}
        {tab === 'account' && (
          <div className="space-y-4">
            {/* Toggle create account */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Create Patient Portal Account
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Patient can log in to view appointments and records
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateAccount(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200
                  ${createAccount ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                  shadow transition-transform duration-200
                  ${createAccount ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {createAccount && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Login Email
                  </label>
                  <input
                    value={watchEmail || ''}
                    readOnly
                    className="w-full border border-gray-200 bg-gray-100 text-gray-500
                               rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Set in Basic Info tab · patient logs in with this email
                  </p>
                  {!watchEmail && (
                    <p className="text-orange-500 text-xs mt-1">
                      ⚠️ Add email in Basic Info tab to create a portal account
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      {...register('password', {
                        required: createAccount && !isEdit && watchEmail
                          ? 'Password required for portal account'
                          : false,
                        minLength: { value: 8, message: 'Min 8 characters' },
                      })}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm
                        focus:outline-none focus:ring-2 transition
                        ${errors.password
                          ? 'border-red-300 focus:ring-red-400 bg-red-50'
                          : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    <button type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-xs text-green-700 font-medium mb-1">
                    What the patient can do after login:
                  </p>
                  <ul className="text-xs text-green-600 space-y-0.5">
                    {[
                      'View all their appointments',
                      'See prescriptions and diagnosis',
                      'Download medical records',
                      'Book new appointments',
                    ].map(item => (
                      <li key={item} className="flex items-center gap-1.5">
                        <FaCheck size={8} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Final summary */}
            <div className="bg-gray-50 border rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Patient Summary
              </p>
              {[
                { label: 'Name',        value: watchName || '—'     },
                { label: 'Email',       value: watchEmail || '—'    },
                { label: 'Phone',       value: watch('phone') || '—' },
                { label: 'Blood Group', value: watch('bloodGroup') || '—' },
                { label: 'Portal',      value: createAccount && watchEmail ? 'Will be created' : 'Not creating' },
              ].map(row => (
                <div key={row.label}
                  className="flex justify-between text-sm border-b border-gray-100 pb-1.5 last:border-0">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setTab('emergency')}
                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl
                           font-semibold text-sm hover:bg-gray-50 transition">
                ← Back
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
          </div>
        )}
      </form>
    </div>
  );
}
