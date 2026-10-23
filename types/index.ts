export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'staff';
  isActive: boolean;
  createdAt: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  availableDays: string[];
  availableSlots: { day: string; slots: string[] }[];
  rating: number;
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  allergies: string[];
}

export interface Appointment {
  _id: string;
  patientName: string;
  doctorName: string;
  service: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
  bookedVia: string;
}

