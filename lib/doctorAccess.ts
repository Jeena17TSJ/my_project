import Doctor from '@/models/Doctor';

export function normalizeDoctorName(doctorName: string) {
  return (doctorName || '')
    .replace(/^Dr\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function doctorNameVariants(doctorName: string) {
  const plainName = normalizeDoctorName(doctorName);
  return Array.from(new Set([
    doctorName,
    plainName,
    plainName ? `Dr. ${plainName}` : '',
    plainName ? `Dr ${plainName}` : '',
    plainName ? `Dr.${plainName}` : '',
  ].filter(Boolean)));
}

export function doctorNameMatchers(doctorName: string) {
  return doctorNameVariants(doctorName).flatMap(name => [
    name,
    new RegExp(`^${escapeRegex(name)}$`, 'i'),
  ]);
}

export function doctorAppointmentQuery(doctor: any) {
  return {
    $or: [
      { doctorId: doctor._id },
      { doctor: doctor._id },
      { doctorName: { $in: doctorNameMatchers(doctor.name) } },
    ],
  };
}

export async function getSessionDoctor(session: any) {
  const user = session?.user as any;
  if (!user || user.role !== 'doctor') return null;

  const conditions: any[] = [{ userId: user.id }];
  if (user.email) conditions.push({ email: user.email.toLowerCase() });
  if (user.name) conditions.push({ name: { $in: doctorNameMatchers(user.name) } });

  const doctor = await Doctor.findOne({
    $or: conditions,
    isActive: { $ne: false },
  }).collation({ locale: 'en', strength: 2 }).lean() as any;

  if (doctor) return doctor;

  const identityText = [
    user.name,
    user.email?.split('@')[0],
  ].filter(Boolean).join(' ');

  const tokens = Array.from(new Set(
    normalizeDoctorName(identityText)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token: string) =>
        token.length >= 3 &&
        !['doctor', 'doc', 'dr', 'dental', 'clinic', 'dentalcare'].includes(token)
      )
  ));

  if (tokens.length === 0) return null;

  const tokenMatches = tokens.map(token => ({
    name: new RegExp(`\\b${escapeRegex(token)}\\b`, 'i'),
  }));

  const candidates = await Doctor.find({
    isActive: { $ne: false },
    $or: tokenMatches,
  }).lean() as any[];

  return candidates.length === 1 ? candidates[0] : null;
}

export function sameId(a: any, b: any) {
  if (!a || !b) return false;
  const left = a._id ? a._id : a;
  const right = b._id ? b._id : b;
  return left.toString() === right.toString();
}
