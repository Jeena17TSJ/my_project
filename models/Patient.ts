// C:\Users\jeena\Desktop\nextgen\dental_project\dental-clinic\models\Patient.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  dob: Date;
  gender: string;
  address: string;
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string;
  emergencyContact: { name: string; phone: string; relation: string };
}

const PatientSchema = new Schema<IPatient>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: String,
  phone: String,
  dob: Date,
  gender: String,
  address: String,
  bloodGroup: String,
  allergies: [String],
  medicalHistory: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
}, { timestamps: true });

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
