import mongoose, { Schema, Document } from 'mongoose';

const MedicalRecordSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: String,
  treatment: String,
  prescription: [{ medicine: String, dosage: String, duration: String }],
  notes: String,
  nextVisit: Date,
  attachments: [String],
}, { timestamps: true });

export default mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
