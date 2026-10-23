// dental-clinic\models\Doctor.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  userId?:         mongoose.Types.ObjectId;
  name:            string;
  specialization:  string;
  qualification:   string;
  experience:      number;
  bio:             string;
  consultationFee: number;
  availableDays:   string[];
  availableSlots:  { day: string; slots: string[] }[];
  rating:          number;
  image?:          string;
  email?:          string;
  phone?:          string;
  sheetDoctorId?:  string;
  isActive:        boolean;
}

const DoctorSchema = new Schema<IDoctor>({
  userId:          { type: Schema.Types.ObjectId, ref: 'User' },
  name:            { type: String, required: true },
  specialization:  { type: String, required: true },
  qualification:   { type: String, default: '' },
  experience:      { type: Number, default: 0 },
  bio:             { type: String, default: '' },
  consultationFee: { type: Number, default: 500 },
  availableDays:   [{ type: String }],
  availableSlots:  [{ day: String, slots: [String] }],
  rating:          { type: Number, default: 4.5, min: 1, max: 5 },
  image:           { type: String, default: '' },
  email:           { type: String, default: '' },
  phone:           { type: String, default: '' },
  sheetDoctorId:   { type: String, default: '' },
  isActive:        { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Doctor
  || mongoose.model<IDoctor>('Doctor', DoctorSchema);
