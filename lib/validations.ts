// ── Types ──────────────────────────────────────────────────
export interface ValidationResult {
  valid:  boolean;
  errors: Record<string, string>;
}

// ── Helpers ────────────────────────────────────────────────
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidIndianPhone = (phone: string): boolean =>
  /^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10));

export const sanitizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  return digits.slice(-10);
};

export const isStrongPassword = (pw: string): boolean =>
  pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);

// ── Appointment ────────────────────────────────────────────
export function validateAppointment(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.patientName?.trim())
    errors.patientName = 'Patient name is required.';

  if (!data.service?.trim())
    errors.service = 'Please select a service.';

  if (!data.date)
    errors.date = 'Please select a date.';
  else if (new Date(data.date) < new Date(new Date().toDateString()))
    errors.date = 'Appointment date cannot be in the past.';

  if (!data.timeSlot?.trim())
    errors.timeSlot = 'Please select a time slot.';

  if (data.phone && !isValidIndianPhone(data.phone))
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';

  if (data.email && !isValidEmail(data.email))
    errors.email = 'Enter a valid email address.';

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Patient ────────────────────────────────────────────────
export function validatePatient(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name?.trim())
    errors.name = 'Patient name is required.';

  if (data.phone && !isValidIndianPhone(data.phone))
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';

  if (data.email && !isValidEmail(data.email))
    errors.email = 'Enter a valid email address.';

  if (data.dob) {
    const dob = new Date(data.dob);
    if (isNaN(dob.getTime()))
      errors.dob = 'Enter a valid date of birth.';
    else if (dob > new Date())
      errors.dob = 'Date of birth cannot be in the future.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── User Registration ──────────────────────────────────────
export function validateRegister(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name?.trim())
    errors.name = 'Full name is required.';
  else if (data.name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.';

  if (!data.email?.trim())
    errors.email = 'Email address is required.';
  else if (!isValidEmail(data.email))
    errors.email = 'Enter a valid email address.';

  if (!data.password)
    errors.password = 'Password is required.';
  else if (!isStrongPassword(data.password))
    errors.password =
      'Password must be at least 8 characters with uppercase, lowercase and a number.';

  if (data.confirmPassword !== undefined && data.confirmPassword !== data.password)
    errors.confirmPassword = 'Passwords do not match.';

  if (data.phone && !isValidIndianPhone(data.phone))
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Login ──────────────────────────────────────────────────
export function validateLogin(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.email?.trim())
    errors.email = 'Email is required.';
  else if (!isValidEmail(data.email))
    errors.email = 'Enter a valid email address.';

  if (!data.password)
    errors.password = 'Password is required.';

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Medical Record ─────────────────────────────────────────
export function validateMedicalRecord(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.diagnosis?.trim())
    errors.diagnosis = 'Diagnosis is required.';

  if (data.nextVisit) {
    const nv = new Date(data.nextVisit);
    if (isNaN(nv.getTime()))
      errors.nextVisit = 'Enter a valid next visit date.';
    else if (nv < new Date(new Date().toDateString()))
      errors.nextVisit = 'Next visit date cannot be in the past.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Doctor ─────────────────────────────────────────────────
export function validateDoctor(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name?.trim())
    errors.name = 'Doctor name is required.';

  if (!data.specialization?.trim())
    errors.specialization = 'Specialization is required.';

  if (data.experience !== undefined && Number(data.experience) < 0)
    errors.experience = 'Experience cannot be negative.';

  if (data.consultationFee !== undefined && Number(data.consultationFee) < 0)
    errors.consultationFee = 'Fee cannot be negative.';

  if (data.rating !== undefined) {
    const r = Number(data.rating);
    if (r < 1 || r > 5) errors.rating = 'Rating must be between 1 and 5.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
